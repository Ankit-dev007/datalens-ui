'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function DataAssetInventoryPage() {
    const [activeTab, setActiveTab] = useState<'assets' | 'discovery'>('assets');
    const [assets, setAssets] = useState<any[]>([]);
    const [discoveries, setDiscoveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Linking Modal State
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [selectedDiscovery, setSelectedDiscovery] = useState<any>(null);
    const [selectedAssetId, setSelectedAssetId] = useState('');

    useEffect(() => {
        loadData();
    }, []);  

    const loadData = async () => {
        console.log("Loading Inventory Data...");
        setLoading(true);
        try {
            console.log("Fetching assets and discoveries...");
            const [assetsData, discoveriesData] = await Promise.all([
                api.getDataAssets(),
                api.getUnmappedDiscoveries()
            ]);
            console.log("Data received:", assetsData, discoveriesData);
            setAssets(assetsData || []);
            setDiscoveries(discoveriesData || []);
        } catch (e) {
            console.error("Failed to load inventory data", e);
        } finally {
            setLoading(false);
        }
    };

    const  openLinkModal = (discovery: any) => {
        setSelectedDiscovery(discovery);
        setSelectedAssetId('');
        setIsLinkModalOpen(true);
    };

    const handleLinkSubmit = async () => {
        if (!selectedAssetId || !selectedDiscovery) return;
        try {
            await api.linkDiscoveryToAsset(selectedAssetId, selectedDiscovery.name, selectedDiscovery.type);
            alert('Linked successfully!');
            setIsLinkModalOpen(false);
            loadData(); // Refresh to show updated lists
        } catch (e: any) {
            alert('Failed to link: ' + e.message);
        }
    };

    if (loading) return <div className="p-8">Loading Inventory...</div>;

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Data Governance Inventory</h1>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('assets')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'assets'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Registered Data Assets
                    </button>
                    <button
                        onClick={() => setActiveTab('discovery')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'discovery'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Unmapped Findings <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{discoveries.length}</span>
                    </button>
                </nav>
            </div>

            {activeTab === 'assets' ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Name</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Category</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Data Classification</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Type</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Volume</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Owner</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Protection</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{asset.name}</td>
                                    <td className="px-6 py-4">{asset.dpdpCategory}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={Array.isArray(asset.personalDataCategories) ? asset.personalDataCategories.join(', ') : ''}>
                                        {Array.isArray(asset.personalDataCategories) ? asset.personalDataCategories.join(', ') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{asset.dataType}</td>
                                    <td className="px-6 py-4 text-gray-500">{asset.volume}</td>
                                    <td className="px-6 py-4 text-gray-500">{asset.ownerUserId}</td>
                                    <td className="px-6 py-4 text-gray-500">{asset.protectionMethod}</td>
                                </tr>
                            ))}
                             {assets.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No data assets registered.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 bg-yellow-50 border-b border-yellow-100 text-yellow-800 text-sm">
                        These items were discovered by scanners. <span className="font-bold">Auto-linked</span> items are suggested based on name matching.
                    </div>
                     <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Discovered Name</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Type</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Storage Location</th>
                                <th className="px-6 py-3 text-right font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {discoveries.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {item.name}
                                        {item.autoLinkedAsset && (
                                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full border border-blue-200">
                                                Auto-Linked: {item.autoLinkedAsset}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4"><span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{item.type}</span></td>
                                    <td className="px-6 py-4 text-gray-500">{item.storage}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {item.autoLinkedAssetId ? (
                                             <button 
                                                onClick={() => {
                                                    setSelectedAssetId(item.autoLinkedAssetId);
                                                    setSelectedDiscovery(item);
                                                    handleLinkSubmit(); // Direct confirm
                                                }}
                                                className="text-green-600 hover:text-green-800 font-medium hover:underline text-xs bg-green-50 px-2 py-1 rounded border border-green-200"
                                            >
                                                Confirm Auto-Link
                                            </button>
                                        ) : null}
                                        <button 
                                            onClick={() => openLinkModal(item)}
                                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                        >
                                            {item.autoLinkedAssetId ? 'Edit' : 'Link to Asset'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                             {discoveries.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No unmapped items found. Great job!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Simple Modal */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Link Discovery to Asset</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Linking <strong>{selectedDiscovery?.name}</strong> to a governance asset.
                        </p>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Data Asset</label>
                            <select 
                                className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={selectedAssetId}
                                onChange={(e) => setSelectedAssetId(e.target.value)}
                            >
                                <option value="">-- Choose Asset --</option>
                                {assets.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setIsLinkModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleLinkSubmit}
                                disabled={!selectedAssetId}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                Link Asset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
