package com.btec.quanlykhohang_api.controllers;


import com.btec.quanlykhohang_api.entities.Order;
import com.btec.quanlykhohang_api.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Get all orders
    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // Fetch orders between startDate and endDate (yyyyMMdd format)
    @GetMapping("/between-dates")
    public ResponseEntity<List<Order>> getOrdersBetweenDates(
            @RequestParam("startDate") Long startDate,
            @RequestParam("endDate") Long endDate) {
        try {
            List<Order> orders = orderService.getOrderFromDateToDateyyyyMMdd(startDate, endDate);
            return ResponseEntity.ok(orders);
        } catch (ParseException e) {
            // Handle invalid date format
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get an order by ID
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        Optional<Order> order = orderService.getOrderById(id);
        return order.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create or update an order
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        Order savedOrder = orderService.saveOrder(order);
        return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);
    }

    // Delete an order
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        orderService.deleteOrder(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
