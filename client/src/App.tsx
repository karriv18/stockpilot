import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/products" element={<div>Products Page</div>} />
        <Route path="/products/new" element={<div>Add Product Page</div>} />
        <Route
          path="/products/:id/edit"
          element={<div>Edit Product Page</div>}
        />
        <Route path="/inventory" element={<div>Inventory Page</div>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
