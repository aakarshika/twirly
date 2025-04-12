import React, { useState } from 'react';
import { 
  Building2, 
  Package, 
  BarChart2, 
  MessageSquare, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2,
  Globe,
  Building,
  Filter,
  Search
} from 'lucide-react';

const CompanyProfile = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Mock company data
  const company = {
    name: 'TechGadgets Inc.',
    industry: 'Consumer Electronics',
    website: 'www.techgadgets.com',
    description: 'Leading manufacturer of innovative tech products since 2010',
    stats: {
      products: 24,
      comparisons: 156,
      reviews: 1200,
      rating: 4.5
    }
  };

  // Mock products data
  const products = [
    {
      id: 1,
      name: 'SmartPhone X',
      category: 'Mobile Phones',
      price: '$999',
      comparisonType: 'cross-company',
      metrics: {
        views: 12500,
        comparisons: 850,
        reviews: 120,
        rating: 4.7
      }
    },
    {
      id: 2,
      name: 'SmartWatch Pro',
      category: 'Wearables',
      price: '$299',
      comparisonType: 'in-company',
      metrics: {
        views: 8500,
        comparisons: 420,
        reviews: 85,
        rating: 4.3
      }
    }
  ];

  // Mock categories
  const categories = [
    'Mobile Phones',
    'Laptops',
    'Wearables',
    'Audio',
    'Smart Home',
    'Gaming'
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <div className="space-y-6">
            {/* Products Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Products</h2>
              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center px-4 py-2 bg-amber-400 text-black rounded-lg hover:bg-amber-300"
              >
                <Plus size={18} className="mr-2" />
                Add Product
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-900 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <p className="text-gray-400">{product.category}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="px-3 py-1 rounded-full text-sm ${
                      product.comparisonType === 'cross-company'
                        ? 'bg-blue-400/10 text-blue-400'
                        : 'bg-green-400/10 text-green-400'
                    }">
                      {product.comparisonType === 'cross-company' ? 'Cross-Company' : 'In-Company'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Price</p>
                      <p className="font-semibold">{product.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Rating</p>
                      <p className="font-semibold">{product.metrics.rating}/5</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-gray-400">Views</p>
                      <p className="font-semibold">{product.metrics.views}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-gray-400">Comparisons</p>
                      <p className="font-semibold">{product.metrics.comparisons}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-gray-400">Reviews</p>
                      <p className="font-semibold">{product.metrics.reviews}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'metrics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Company Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Total Products</h3>
                <p className="text-3xl font-bold">{company.stats.products}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Total Comparisons</h3>
                <p className="text-3xl font-bold">{company.stats.comparisons}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Total Reviews</h3>
                <p className="text-3xl font-bold">{company.stats.reviews}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
                <p className="text-3xl font-bold">{company.stats.rating}/5</p>
              </div>
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Product Reviews</h2>
            {/* Add review list component here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Company Header */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 bg-gray-800 rounded-xl flex items-center justify-center">
                <Building2 size={48} className="text-gray-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{company.name}</h1>
                <div className="flex items-center text-gray-400 mt-1">
                  <Globe size={16} className="mr-1" />
                  {company.website}
                </div>
                <p className="text-gray-300 mt-2">{company.description}</p>
                <div className="flex items-center text-gray-400 mt-2">
                  <Building size={16} className="mr-1" />
                  {company.industry}
                </div>
              </div>
            </div>
            <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-2 px-4 ${
              activeTab === 'products'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <Package size={18} className="mr-2" />
              Products
            </div>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`pb-2 px-4 ${
              activeTab === 'metrics'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <BarChart2 size={18} className="mr-2" />
              Metrics
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 px-4 ${
              activeTab === 'reviews'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <MessageSquare size={18} className="mr-2" />
              Reviews
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile; 