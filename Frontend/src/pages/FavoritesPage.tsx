import React from "react";
import { Navigate } from "react-router-dom";

const FavoritesPage = () => <Navigate to="/profile?tab=wishlist" replace />;

export default FavoritesPage;
