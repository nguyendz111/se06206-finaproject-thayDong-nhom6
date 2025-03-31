package com.btec.quanlykhohang_api.services;

import com.btec.quanlykhohang_api.entities.Order;
import com.btec.quanlykhohang_api.entities.Product;
import com.btec.quanlykhohang_api.repositories.OrderRepository;
import com.btec.quanlykhohang_api.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.TimeZone;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ProductRepository productRepository;
    // Get all orders
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Get an order by ID
    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    // Create or update an order
//    public Order saveOrder(Order order) {
//        order.setCreatedDate(new Date());
//        order.setProducts(null);
//        return orderRepository.save(order);
//    }

    // Create or update an order
    public Order saveOrder(Order order) {
        if (order.getProductIds() != null && !order.getProductIds().isEmpty()) {
            List<Product> products = productRepository.findAllById(order.getProductIds());
            order.setProducts(products);

            double total = 0;
            for(Product p: products){
                total = total + p.getPrice();

            }
            order.setCreatedDate(new Date());
            order.setTotalPrice(total);

            // Populate product details
        }
        return orderRepository.save(order);
    }


    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyyMMdd");

    // Fetch orders within a date range
//    public List<Order> getOrderFromDateToDateyyyyMMdd(Long startDate, Long endDate) throws ParseException, ParseException {
//        // Convert Long to Date
//        Date start = DATE_FORMAT.parse(String.valueOf(startDate));
//        Date end = DATE_FORMAT.parse(String.valueOf(endDate));
//        return orderRepository.findByCreatedDateBetween(start, end);
//    }

    public List<Order> getOrderFromDateToDateyyyyMMdd(Long startDate, Long endDate) throws ParseException {
        // Create a SimpleDateFormat instance for yyyyMMdd format
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");
        // Set the timezone to UTC
        dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));

        // Convert Long to Date
        Date start = dateFormat.parse(String.valueOf(startDate));
        Date end = dateFormat.parse(String.valueOf(endDate));

        // Adjust the end date to include the entire day
        end = new Date(end.getTime() + (24 * 60 * 60 * 1000) - 1);

        // Fetch orders between the two dates
        return orderRepository.findByCreatedDateBetween(start, end);
    }

    // Delete an order by ID
    public void deleteOrder(String id) {
        orderRepository.deleteById(id);
    }
}
