import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, Users, Package, Download, ShoppingCart, CheckCircle, Eye } from 'lucide-react';

export default function JantecPortal() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [showInvoiceSettings, setShowInvoiceSettings] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  const [businessInfo, setBusinessInfo] = useState({ name: 'JANTEC', address: '', phone: '', email: '' });
  const [productForm, setProductForm] = useState({ name: '', category: 'Sports & Outdoor', description: '', price: '', sku: '' });
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', address: '', city: '', province: '', postalCode: '' });
  const [orderForm, setOrderForm] = useState({ customerId: '', items: [], notes: '' });
  const [currentItem, setCurrentItem] = useState({ productId: '', quantity: '' });
  const [invoiceSettings, setInvoiceSettings] = useState({ orderId: null, taxRate: '14.975', paymentTerms: 'Net 30' });

  // Load data from localStorage on startup
  useEffect(() => {
    const savedProducts = localStorage.getItem('jantec-products');
    const savedCustomers = localStorage.getItem('jantec-customers');
    const savedOrders = localStorage.getItem('jantec-orders');
    const savedInvoices = localStorage.getItem('jantec-invoices');
    const savedBusiness = localStorage.getItem('jantec-business');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedBusiness) setBusinessInfo(JSON.parse(savedBusiness));
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem('jantec-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('jantec-customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('jantec-orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('jantec-invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('jantec-business', JSON.stringify(businessInfo));
  }, [businessInfo]);

  const handleAddProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.sku) {
      alert('Please fill in all required fields (Name, SKU, Price)');
      return;
    }

    const newProduct = editingProduct
      ? { ...productForm, id: editingProduct.id }
      : { ...productForm, id: Date.now() };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
      setEditingProduct(null);
    } else {
      setProducts([...products, newProduct]);
    }
    setProductForm({ name: '', category: 'Sports & Outdoor', description: '', price: '', sku: '' });
    setShowProductForm(false);
  };

  const handleAddCustomer = () => {
    if (!customerForm.name || !customerForm.email) {
      alert('Please fill in all required fields (Name, Email)');
      return;
    }

    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...customerForm, id: c.id } : c));
      setEditingCustomer(null);
    } else {
      setCustomers([...customers, { ...customerForm, id: Date.now() }]);
    }
    setCustomerForm({ name: '', email: '', phone: '', address: '', city: '', province: '', postalCode: '' });
    setShowCustomerForm(false);
  };

  const handleAddItemToOrder = () => {
    if (currentItem.productId && currentItem.quantity) {
      const product = products.find(p => p.id === parseInt(currentItem.productId));
      setOrderForm({
        ...orderForm,
        items: [...orderForm.items, { ...product, quantity: parseInt(currentItem.quantity), total: parseFloat(product.price) * parseInt(currentItem.quantity) }]
      });
      setCurrentItem({ productId: '', quantity: '' });
    }
  };

  const createOrder = () => {
    const customer = customers.find(c => c.id === parseInt(orderForm.customerId));
    const subtotal = orderForm.items.reduce((sum, item) => sum + item.total, 0);
    const order = {
      id: Date.now(), orderNumber: `ORD-${Date.now()}`, date: new Date().toLocaleDateString(),
      customer, items: orderForm.items, subtotal, status: 'Pending', notes: orderForm.notes, invoiceId: null
    };
    setOrders([...orders, order]);
    setOrderForm({ customerId: '', items: [], notes: '' });
    setShowOrderForm(false);
    setActiveTab('orders');
  };

  const updateOrder = () => {
    const customer = customers.find(c => c.id === parseInt(orderForm.customerId));
    const subtotal = orderForm.items.reduce((sum, item) => sum + item.total, 0);
    setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, customer, items: orderForm.items, subtotal, notes: orderForm.notes } : o));
    setEditingOrder(null);
    setOrderForm({ customerId: '', items: [], notes: '' });
    setShowOrderForm(false);
  };

  const handleEditOrder = (order) => {
    if (order.status === 'Invoiced') { alert('Cannot edit an invoiced order.'); return; }
    setEditingOrder(order);
    setOrderForm({ customerId: order.customer.id.toString(), items: order.items, notes: order.notes });
    setShowOrderForm(true);
  };

  const releaseOrder = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Released' } : o));
  };

  const confirmGenerateInvoice = () => {
    const order = orders.find(o => o.id === invoiceSettings.orderId);
    if (!order || order.status !== 'Released') { alert('Order must be Released.'); return; }
    const tax = order.subtotal * (parseFloat(invoiceSettings.taxRate) / 100);
    const total = order.subtotal + tax;
    const invoice = {
      id: Date.now(), invoiceNumber: `INV-${Date.now()}`, date: new Date().toLocaleDateString(),
      customer: order.customer, items: order.items, subtotal: order.subtotal, taxRate: invoiceSettings.taxRate,
      tax, total, paymentTerms: invoiceSettings.paymentTerms, notes: order.notes, orderId: order.id, orderNumber: order.orderNumber
    };
    setInvoices([...invoices, invoice]);
    setOrders(orders.map(o => o.id === invoiceSettings.orderId ? { ...o, status: 'Invoiced', invoiceId: invoice.id } : o));
    setShowInvoiceSettings(false);
    setActiveTab('invoices');
  };

  const viewInvoice = (invoice) => {
    setPreviewInvoice(invoice);
    setShowInvoicePreview(true);
  };

  const copyInvoiceHTML = (invoice) => {
    const html = generateInvoiceHTML(invoice);
    navigator.clipboard.writeText(html).then(() => {
      alert('Invoice HTML copied to clipboard!\n\nTo create PDF:\n1. Paste into a text editor\n2. Save as invoice.html\n3. Open in browser\n4. Press Ctrl+P (or Cmd+P)\n5. Select "Save as PDF"');
    }).catch(() => {
      alert('Could not copy to clipboard. Please use the View button to see and manually copy the HTML.');
    });
  };

  const generateInvoiceHTML = (invoice) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 40px;
            margin: 0;
            max-width: 900px;
            margin: 0 auto;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 3px solid #FF3333;
            padding-bottom: 20px;
        }
        h1 {
            margin: 0 0 10px 0;
            color: #2D3047;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #2D3047;
            color: white;
            padding: 12px;
            text-align: left;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        .total-section {
            margin-top: 30px;
            text-align: right;
        }
        .total-section div {
            margin: 8px 0;
        }
        .final-total {
            font-size: 20px;
            font-weight: bold;
            color: #FF3333;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px solid #ddd;
        }
        @media print {
            @page {
                margin: 0.5in;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1 style="color:#FF3333;font-size:32px;">JANTEC</h1>
            <div style="color:#666;font-size:14px;">
                ${businessInfo.address || '123 Business Street'}<br>
                ${businessInfo.phone || '(514) 555-0100'}<br>
                ${businessInfo.email || 'info@jantec.com'}
            </div>
        </div>
        <div>
            <h1>INVOICE</h1>
            <div style="margin-top:10px;">
                <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
                <div><strong>Order #:</strong> ${invoice.orderNumber}</div>
                <div><strong>Date:</strong> ${invoice.date}</div>
                <div><strong>Payment Terms:</strong> ${invoice.paymentTerms}</div>
            </div>
        </div>
    </div>

    <div style="margin-bottom:40px;padding:15px;background-color:#f9f9f9;border-left:4px solid #FF3333;">
        <div style="font-weight:bold;margin-bottom:10px;font-size:16px;">BILL TO:</div>
        <div style="font-size:15px;"><strong>${invoice.customer.name}</strong></div>
        <div>${invoice.customer.address}</div>
        <div>${invoice.customer.city}, ${invoice.customer.province} ${invoice.customer.postalCode}</div>
        <div style="margin-top:5px;">Email: ${invoice.customer.email}</div>
        <div>Phone: ${invoice.customer.phone}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:15%;">SKU</th>
                <th style="width:20%;">Product</th>
                <th style="width:30%;">Description</th>
                <th style="width:10%;">Qty</th>
                <th style="width:12%;">Unit Price</th>
                <th style="width:13%;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.items.map(item=>`
            <tr>
                <td>${item.sku}</td>
                <td><strong>${item.name}</strong></td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td><strong>$${item.total.toFixed(2)}</strong></td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="total-section">
        <div style="font-size:16px;">Subtotal: <strong>$${invoice.subtotal.toFixed(2)}</strong></div>
        <div style="font-size:16px;">Tax (${invoice.taxRate}%): <strong>$${invoice.tax.toFixed(2)}</strong></div>
        <div class="final-total">TOTAL: $${invoice.total.toFixed(2)}</div>
    </div>

    ${invoice.notes ? `
    <div style="margin-top:50px;padding:15px;background-color:#fffbf0;border:1px solid #e0e0e0;">
        <strong>NOTES:</strong><br>
        <div style="margin-top:8px;">${invoice.notes}</div>
    </div>
    ` : ''}

    <div style="margin-top:80px;text-align:center;color:#999;font-size:12px;border-top:1px solid #ddd;padding-top:20px;">
        Thank you for your business! | JANTEC Distribution
    </div>
</body>
</html>`;
  };

  const getStatusColor = (status) => {
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Released') return 'bg-blue-100 text-blue-800';
    if (status === 'Invoiced') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-4">
                <img src="https://i.imgur.com/JShG1Uh.png" alt="JANTEC" style={{height:'60px',width:'auto'}} onError={(e)=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}} />
                <div style={{width:'60px',height:'60px',backgroundColor:'#DC2626',borderRadius:'50%',alignItems:'center',justifyContent:'center',display:'none'}}>
                  <span style={{fontSize:'30px',fontWeight:'bold',color:'white'}}>J</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Distribution Portal</p>
                <p className="text-gray-500 text-xs">Products: {products.length} | Customers: {customers.length} | Orders: {orders.length}</p>
              </div>
            </div>
            <button onClick={() => setShowBusinessForm(true)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Settings</button>
          </div>
        </div>
      </div>

      {showBusinessForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Business Information</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-2">Business Name</label><input type="text" value={businessInfo.name} onChange={(e)=>setBusinessInfo({...businessInfo,name:e.target.value})} className="w-full px-3 py-2 border rounded"/></div>
              <div><label className="block text-sm font-medium mb-2">Address</label><input type="text" value={businessInfo.address} onChange={(e)=>setBusinessInfo({...businessInfo,address:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="123 Business St, Montreal, QC"/></div>
              <div><label className="block text-sm font-medium mb-2">Phone</label><input type="tel" value={businessInfo.phone} onChange={(e)=>setBusinessInfo({...businessInfo,phone:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="(514) 555-0100"/></div>
              <div><label className="block text-sm font-medium mb-2">Email</label><input type="email" value={businessInfo.email} onChange={(e)=>setBusinessInfo({...businessInfo,email:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="info@jantec.com"/></div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={()=>setShowBusinessForm(false)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded flex-1">Save</button>
              <button onClick={()=>setShowBusinessForm(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showInvoicePreview && previewInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Invoice Preview - {previewInvoice.invoiceNumber}</h3>
              <div className="flex space-x-2">
                <button onClick={() => copyInvoiceHTML(previewInvoice)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                  Copy HTML
                </button>
                <button onClick={() => setShowInvoicePreview(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm">
                  Close
                </button>
              </div>
            </div>
            <div className="p-8" dangerouslySetInnerHTML={{__html: generateInvoiceHTML(previewInvoice).replace('<!DOCTYPE html>', '').replace('<html>', '').replace('</html>', '').replace(/<head>[\s\S]*?<\/head>/, '')}} />
          </div>
        </div>
      )}

      {showInvoiceSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Invoice Settings</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-2">Tax Rate (%)</label><input type="number" step="0.001" value={invoiceSettings.taxRate} onChange={(e)=>setInvoiceSettings({...invoiceSettings,taxRate:e.target.value})} className="w-full px-3 py-2 border rounded"/></div>
              <div><label className="block text-sm font-medium mb-2">Payment Terms</label><select value={invoiceSettings.paymentTerms} onChange={(e)=>setInvoiceSettings({...invoiceSettings,paymentTerms:e.target.value})} className="w-full px-3 py-2 border rounded"><option>Net 30</option><option>Net 60</option><option>Net 90</option><option>Due on Receipt</option></select></div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={confirmGenerateInvoice} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded flex-1">Generate Invoice</button>
              <button onClick={()=>setShowInvoiceSettings(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1">
            <button onClick={()=>setActiveTab('products')} className={`flex items-center space-x-2 px-6 py-4 font-medium ${activeTab==='products'?'text-red-600 border-b-2 border-red-600':'text-gray-600'}`}><Package size={20}/><span>Products</span></button>
            <button onClick={()=>setActiveTab('customers')} className={`flex items-center space-x-2 px-6 py-4 font-medium ${activeTab==='customers'?'text-red-600 border-b-2 border-red-600':'text-gray-600'}`}><Users size={20}/><span>Customers</span></button>
            <button onClick={()=>setActiveTab('orders')} className={`flex items-center space-x-2 px-6 py-4 font-medium ${activeTab==='orders'?'text-red-600 border-b-2 border-red-600':'text-gray-600'}`}><ShoppingCart size={20}/><span>Orders</span></button>
            <button onClick={()=>setActiveTab('invoices')} className={`flex items-center space-x-2 px-6 py-4 font-medium ${activeTab==='invoices'?'text-red-600 border-b-2 border-red-600':'text-gray-600'}`}><FileText size={20}/><span>Invoices</span></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Product Catalog</h2>
              <button onClick={()=>{setEditingProduct(null);setProductForm({name:'',category:'Sports & Outdoor',description:'',price:'',sku:''});setShowProductForm(true);}} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center space-x-2">
                <Plus size={20}/><span>Add Product</span>
              </button>
            </div>

            {showProductForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">{editingProduct?'Edit Product':'New Product'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-2">Product Name *</label><input type="text" value={productForm.name} onChange={(e)=>setProductForm({...productForm,name:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="e.g., Mountain Bike"/></div>
                  <div><label className="block text-sm font-medium mb-2">Category</label><select value={productForm.category} onChange={(e)=>setProductForm({...productForm,category:e.target.value})} className="w-full px-3 py-2 border rounded"><option>Sports & Outdoor</option><option>Tools</option><option>Automobile Accessories</option></select></div>
                  <div><label className="block text-sm font-medium mb-2">SKU *</label><input type="text" value={productForm.sku} onChange={(e)=>setProductForm({...productForm,sku:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="e.g., MB-001"/></div>
                  <div><label className="block text-sm font-medium mb-2">Price ($) *</label><input type="number" step="0.01" value={productForm.price} onChange={(e)=>setProductForm({...productForm,price:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="0.00"/></div>
                  <div className="col-span-2"><label className="block text-sm font-medium mb-2">Description</label><textarea value={productForm.description} onChange={(e)=>setProductForm({...productForm,description:e.target.value})} className="w-full px-3 py-2 border rounded" rows="3" placeholder="Product description..."/></div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button onClick={handleAddProduct} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded">{editingProduct?'Update':'Add'} Product</button>
                  <button onClick={()=>{setShowProductForm(false);setEditingProduct(null);}} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded">Cancel</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {products.length===0?(
                <div className="p-12 text-center text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-50"/>
                  <p>No products yet. Click Add Product to get started.</p>
                </div>
              ):(
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">SKU</th>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Category</th>
                      <th className="px-6 py-3 text-left">Description</th>
                      <th className="px-6 py-3 text-left">Price</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product)=>(
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{product.sku}</td>
                        <td className="px-6 py-4 font-medium">{product.name}</td>
                        <td className="px-6 py-4">{product.category}</td>
                        <td className="px-6 py-4 text-sm">{product.description}</td>
                        <td className="px-6 py-4">${parseFloat(product.price).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button onClick={()=>{setEditingProduct(product);setProductForm(product);setShowProductForm(true);}} className="text-blue-600 hover:text-blue-800"><Edit2 size={18}/></button>
                            <button onClick={()=>setProducts(products.filter(p=>p.id!==product.id))} className="text-red-600 hover:text-red-800"><Trash2 size={18}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Customer Directory</h2>
              <button onClick={()=>{setEditingCustomer(null);setCustomerForm({name:'',email:'',phone:'',address:'',city:'',province:'',postalCode:''});setShowCustomerForm(true);}} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center space-x-2">
                <Plus size={20}/><span>Add Customer</span>
              </button>
            </div>

            {showCustomerForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">{editingCustomer?'Edit Customer':'New Customer'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-2">Customer Name *</label><input type="text" value={customerForm.name} onChange={(e)=>setCustomerForm({...customerForm,name:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="John Doe"/></div>
                  <div><label className="block text-sm font-medium mb-2">Email *</label><input type="email" value={customerForm.email} onChange={(e)=>setCustomerForm({...customerForm,email:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="john@example.com"/></div>
                  <div><label className="block text-sm font-medium mb-2">Phone</label><input type="tel" value={customerForm.phone} onChange={(e)=>setCustomerForm({...customerForm,phone:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="(514) 555-0100"/></div>
                  <div><label className="block text-sm font-medium mb-2">Address</label><input type="text" value={customerForm.address} onChange={(e)=>setCustomerForm({...customerForm,address:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="123 Main St"/></div>
                  <div><label className="block text-sm font-medium mb-2">City</label><input type="text" value={customerForm.city} onChange={(e)=>setCustomerForm({...customerForm,city:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="Montreal"/></div>
                  <div><label className="block text-sm font-medium mb-2">Province</label><input type="text" value={customerForm.province} onChange={(e)=>setCustomerForm({...customerForm,province:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="QC"/></div>
                  <div><label className="block text-sm font-medium mb-2">Postal Code</label><input type="text" value={customerForm.postalCode} onChange={(e)=>setCustomerForm({...customerForm,postalCode:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="H1A 1A1"/></div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button onClick={handleAddCustomer} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded">{editingCustomer?'Update':'Add'} Customer</button>
                  <button onClick={()=>{setShowCustomerForm(false);setEditingCustomer(null);}} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded">Cancel</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {customers.length===0?(
                <div className="p-12 text-center text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50"/>
                  <p>No customers yet. Click Add Customer to get started.</p>
                </div>
              ):(
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Phone</th>
                      <th className="px-6 py-3 text-left">Address</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer)=>(
                      <tr key={customer.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{customer.name}</td>
                        <td className="px-6 py-4">{customer.email}</td>
                        <td className="px-6 py-4">{customer.phone}</td>
                        <td className="px-6 py-4 text-sm">{customer.address}, {customer.city}, {customer.province} {customer.postalCode}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button onClick={()=>{setEditingCustomer(customer);setCustomerForm(customer);setShowCustomerForm(true);}} className="text-blue-600 hover:text-blue-800"><Edit2 size={18}/></button>
                            <button onClick={()=>setCustomers(customers.filter(c=>c.id!==customer.id))} className="text-red-600 hover:text-red-800"><Trash2 size={18}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Orders</h2>
              <button onClick={()=>{if(customers.length===0||products.length===0){alert('Please add at least one customer and one product first.');return;}setEditingOrder(null);setOrderForm({customerId:'',items:[],notes:''});setShowOrderForm(true);}} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center space-x-2">
                <Plus size={20}/><span>Create Order</span>
              </button>
            </div>

            {showOrderForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">{editingOrder?'Edit Order':'New Order'}</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Select Customer</label>
                  <select value={orderForm.customerId} onChange={(e)=>setOrderForm({...orderForm,customerId:e.target.value})} className="w-full px-3 py-2 border rounded">
                    <option value="">Choose a customer...</option>
                    {customers.map(customer=>(<option key={customer.id} value={customer.id}>{customer.name}</option>))}
                  </select>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold mb-3">Add Products</h4>
                  <div className="flex space-x-3 mb-4">
                    <div className="flex-1">
                      <select value={currentItem.productId} onChange={(e)=>setCurrentItem({...currentItem,productId:e.target.value})} className="w-full px-3 py-2 border rounded">
                        <option value="">Select product...</option>
                        {products.map(product=>(<option key={product.id} value={product.id}>{product.name} - ${parseFloat(product.price).toFixed(2)}</option>))}
                      </select>
                    </div>
                    <div className="w-32">
                      <input type="number" placeholder="Quantity" value={currentItem.quantity} onChange={(e)=>setCurrentItem({...currentItem,quantity:e.target.value})} className="w-full px-3 py-2 border rounded"/>
                    </div>
                    <button onClick={handleAddItemToOrder} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Add</button>
                  </div>

                  {orderForm.items.length>0 && (
                    <table className="w-full mb-4">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Product</th>
                          <th className="px-4 py-2 text-left">Quantity</th>
                          <th className="px-4 py-2 text-left">Price</th>
                          <th className="px-4 py-2 text-left">Total</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderForm.items.map((item,index)=>(
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2">{item.quantity}</td>
                            <td className="px-4 py-2">${parseFloat(item.price).toFixed(2)}</td>
                            <td className="px-4 py-2">${item.total.toFixed(2)}</td>
                            <td className="px-4 py-2">
                              <button onClick={()=>setOrderForm({...orderForm,items:orderForm.items.filter((_,i)=>i!==index)})} className="text-red-600 hover:text-red-800">
                                <Trash2 size={16}/>
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="font-semibold">
                          <td colSpan="3" className="px-4 py-2 text-right">Subtotal:</td>
                          <td className="px-4 py-2">${orderForm.items.reduce((sum,item)=>sum+item.total,0).toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <textarea value={orderForm.notes} onChange={(e)=>setOrderForm({...orderForm,notes:e.target.value})} className="w-full px-3 py-2 border rounded" rows="3" placeholder="Additional notes or special instructions..."/>
                </div>

                <div className="flex space-x-3">
                  <button onClick={editingOrder?updateOrder:createOrder} disabled={!orderForm.customerId||orderForm.items.length===0} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {editingOrder?'Update Order':'Create Order'}
                  </button>
                  <button onClick={()=>{setShowOrderForm(false);setEditingOrder(null);setOrderForm({customerId:'',items:[],notes:''});}} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded">Cancel</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {orders.length===0?(
                <div className="p-12 text-center text-gray-500">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-50"/>
                  <p>No orders yet. Click Create Order to get started.</p>
                </div>
              ):(
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Order #</th>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-left">Customer</th>
                      <th className="px-6 py-3 text-left">Items</th>
                      <th className="px-6 py-3 text-left">Total</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order)=>(
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                        <td className="px-6 py-4">{order.date}</td>
                        <td className="px-6 py-4">{order.customer.name}</td>
                        <td className="px-6 py-4">{order.items.length} items</td>
                        <td className="px-6 py-4 font-semibold">${order.subtotal.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {order.status==='Pending' && (
                              <>
                                <button onClick={()=>handleEditOrder(order)} className="text-blue-600 hover:text-blue-800" title="Edit Order">
                                  <Edit2 size={18}/>
                                </button>
                                <button onClick={()=>releaseOrder(order.id)} className="text-green-600 hover:text-green-800" title="Release Order">
                                  <CheckCircle size={18}/>
                                </button>
                              </>
                            )}
                            {order.status==='Released' && (
                              <button onClick={()=>{setInvoiceSettings({orderId:order.id,taxRate:'14.975',paymentTerms:'Net 30'});setShowInvoiceSettings(true);}} className="text-purple-600 hover:text-purple-800 flex items-center space-x-1" title="Generate Invoice">
                                <FileText size={18}/>
                                <span className="text-sm">Invoice</span>
                              </button>
                            )}
                            {order.status==='Invoiced' && order.invoiceId && (
                              <button onClick={()=>{const invoice=invoices.find(inv=>inv.id===order.invoiceId);if(invoice)viewInvoice(invoice);}} className="text-blue-600 hover:text-blue-800 flex items-center space-x-1" title="View Invoice">
                                <Eye size={18}/>
                                <span className="text-sm">View</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Invoices</h2>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {invoices.length===0?(
                <div className="p-12 text-center text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 opacity-50"/>
                  <p>No invoices yet. Create and release orders to generate invoices.</p>
                </div>
              ):(
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Invoice #</th>
                      <th className="px-6 py-3 text-left">Order #</th>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-left">Customer</th>
                      <th className="px-6 py-3 text-left">Items</th>
                      <th className="px-6 py-3 text-left">Total</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice)=>(
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{invoice.invoiceNumber}</td>
                        <td className="px-6 py-4">{invoice.orderNumber}</td>
                        <td className="px-6 py-4">{invoice.date}</td>
                        <td className="px-6 py-4">{invoice.customer.name}</td>
                        <td className="px-6 py-4">{invoice.items.length} items</td>
                        <td className="px-6 py-4 font-semibold">${invoice.total.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button onClick={()=>viewInvoice(invoice)} className="text-blue-600 hover:text-blue-800 flex items-center space-x-1" title="View Invoice">
                              <Eye size={18}/>
                              <span className="text-sm">View</span>
                            </button>
                            <button onClick={()=>copyInvoiceHTML(invoice)} className="text-green-600 hover:text-green-800 flex items-center space-x-1" title="Copy HTML">
                              <Download size={18}/>
                              <span className="text-sm">Copy</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
