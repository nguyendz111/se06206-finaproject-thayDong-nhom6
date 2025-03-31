package com.btec.quanlykhohang_api.repositories;

import com.btec.quanlykhohang_api.entities.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {
    Optional<Product> findByName(String name);
    List<Product> findByCategory(String category);
}

