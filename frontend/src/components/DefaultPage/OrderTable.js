import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spinner, Table, Badge } from "react-bootstrap";
import './OrderTable.css';

const OrderTable = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dateError, setDateError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("User not authenticated.");
                const response = await axios.get("http://localhost:8000/api/my-orders", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrders(response.data || []);
                setFilteredOrders(response.data || []); // Initialize filtered orders
                console.log("Orders fetched:", response.data); // Debug log
            } catch (err) {
                console.error("Error fetching orders:", err.message || err);
                setError("Failed to load orders. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!startDate || !endDate || dateError) {
            setFilteredOrders(orders); // Show all orders if no filters are applied
            return;
        }

        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(23, 59, 59, 999);

        const filtered = orders.filter((order) => {
            const orderDate = new Date(order.checkout_date).getTime();
            return orderDate >= start && orderDate <= end;
        });

        setFilteredOrders(filtered);
    }, [startDate, endDate, orders, dateError]);

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);

        if (endDate && newStartDate > endDate) {
            setDateError("Start date cannot be later than end date.");
        } else {
            setDateError("");
        }
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);

        if (startDate && newEndDate < startDate) {
            setDateError("End date cannot be earlier than start date.");
        } else {
            setDateError("");
        }
    };

    const handleRowClick = (orderId) => {
        setSelectedOrder(orderId === selectedOrder ? null : orderId); // Toggle row selection
    };

    const getStatusVariant = (status) => {
        switch ((status || "").toLowerCase()) {
            case "pending": return "warning";
            case "completed": return "success";
            case "canceled": return "danger";
            default: return "secondary";
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-4">
                <Spinner animation="border" variant="warning" />
                <span className="ms-3 text-muted">Loading your orders...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center">
                <p className="text-danger fw-bold">{error}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="card p-3 mb-4 shadow-sm">
                <h5 className="card-title text-center">Filter Orders</h5>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Start Date:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={handleStartDateChange}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">End Date:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={handleEndDateChange}
                            min={startDate}
                        />
                    </div>
                </div>
                {dateError && <p className="text-danger mt-2">{dateError}</p>}
            </div>

            <div className="table-responsive">
                <Table striped bordered hover className="shadow-lg table-custom">
                    <thead className="table-header text-center">
                        <tr>
                            <th className="text-white">Order ID</th>
                            <th className="text-white">Product</th>
                            <th className="text-white">Quantity</th>
                            <th className="text-white">Total Price</th>
                            <th className="text-white">Checkout Date</th>
                            <th className="text-white">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) =>
                                order.items?.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={selectedOrder === order.id ? "selected" : ""}
                                        onClick={() => handleRowClick(order.id)}
                                    >
                                        <td className="fw-semibold text-center">{order.id}</td>
                                        <td className="text-center">
                                            {item.product?.name || <span className="text-muted">Unknown Product</span>}
                                        </td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td className="fw-bold text-center text-success">
                                            ₱{(item.product?.price * item.quantity).toLocaleString("en-PH", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="text-center text-info">
                                            {/* Display checkout date */}
                                            {order.checkout_date
                                                ? new Date(order.checkout_date).toLocaleString("en-PH", {
                                                      timeZone: "Asia/Manila",
                                                  })
                                                : "N/A"}
                                        </td>
                                        <td className="text-center">
                                            <Badge bg={getStatusVariant(order.status)}>{order.status}</Badge>
                                        </td>
                                    </tr>
                                ))
                            )
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted fw-bold py-3">
                                    No orders found. <a href="/shop" className="text-primary">Start shopping</a>.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </>
    );
};

export default OrderTable;
