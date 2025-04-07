//CustomerDashboard.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Spinner } from "react-bootstrap";
import ProductCatalog from "./ProductCatalog";
import Carousel from 'react-bootstrap/Carousel';

const CustomerDashboard = ({ isAuthenticated }) => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check for search parameter in URL
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search');
        if (searchParam) {
            setSearchTerm(searchParam);
        }
        
        fetchProducts();
    }, [location.search]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8000/api/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="container mt-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                

                <div className="card p-4 shadow-lg">
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center">
                            <Spinner animation="border" variant="primary" />
                            <span className="ms-2">Loading products...</span>
                        </div>
                    ) : (
                        <ProductCatalog products={filteredProducts} />
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CustomerDashboard;