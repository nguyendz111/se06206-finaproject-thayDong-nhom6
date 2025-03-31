package com.btec.quanlykhohang_api.controllers;
import com.btec.quanlykhohang_api.entities.Product;
import com.btec.quanlykhohang_api.security.JwtUtil;
import com.btec.quanlykhohang_api.services.ProductService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;


    private void validateToken(HttpServletRequest request) throws Exception {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new Exception("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7); // Extract the token part
        JwtUtil.verifyToken(token); // Validate the token
    }
    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

//    @GetMapping
//    public List<Product> getAllProducts() {
//        return productService.getAllProducts();
//    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(HttpServletRequest request) {
        try {
            validateToken(request);
            return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }
    }

//    @GetMapping("/{id}")
//    public ResponseEntity<Product> getProductById(@PathVariable String id) {
//        Optional<Product> product = productService.getProductById(id);
//        return product.map(ResponseEntity::ok)
//                .orElseGet(() -> ResponseEntity.notFound().build());
//    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id, HttpServletRequest request) {
        try {
            validateToken(request);
            Optional<Product> product = productService.getProductById(id);
            return product.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Create a new product (requires valid JWT token).
     *
     * @param product The product to create.
     * @param request The HTTP request.
     * @return The created product.
     */
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product, HttpServletRequest request) {
        try {
            validateToken(request);
            Product createdProduct = productService.addProduct(product);
            return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/category/{category}")
    public List<Product> getProductsByCategory(@PathVariable String category) {
        return productService.getProductsByCategory(category);
    }

//    @PostMapping
//    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
//        Product createdProduct = productService.addProduct(product);
//        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
//    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct( HttpServletRequest request, @PathVariable String id, @RequestBody Product product) {
        try {
            validateToken(request);
            Product updatedProduct = productService.updateProduct(id, product);
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct( HttpServletRequest request, @PathVariable String id) {

        try {
            validateToken(request);
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
//            Product updatedProduct = productService.updateProduct(id, product);
//            return new ResponseEntity<>(null, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }

    }
}
