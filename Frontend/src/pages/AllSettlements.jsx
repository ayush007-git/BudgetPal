import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AllSettlements = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const settlements = location.state?.settlements || [];

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={() => navigate('/dashboard')}
                    style={{ 
                        padding: '8px 16px', 
                        marginBottom: '20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to Dashboard
                </button>
                <h2>All Settlements</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                    Outstanding balances across all your groups
                </p>
            </div>
            
            {settlements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                    <h3 style={{ color: '#28a745', marginBottom: '8px' }}>All settled up!</h3>
                    <p>No outstanding payments in any of your groups.</p>
                </div>
            ) : (
                <div>
                    <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#e7f3ff', borderRadius: '8px', border: '1px solid #b3d9ff' }}>
                        <strong>Total settlements: {settlements.length}</strong>
                    </div>
                    {settlements.map((settlement, index) => (
                        <div 
                            key={index}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '12px',
                                backgroundColor: '#f9f9f9',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                                {settlement.from} owes {settlement.to} ₹{settlement.amount}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Group: {settlement.groupName}</span>
                                <span style={{ 
                                    backgroundColor: '#007bff', 
                                    color: 'white', 
                                    padding: '2px 8px', 
                                    borderRadius: '12px', 
                                    fontSize: '12px' 
                                }}>
                                    {settlement.groupId}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllSettlements;