package com.ufam.uforum.repository;

import com.ufam.uforum.entity.Product;
import com.ufam.uforum.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    @Query(value = "SELECT p FROM Product p JOIN FETCH p.seller WHERE p.status = :status AND p.isActive = true",
           countQuery = "SELECT COUNT(p) FROM Product p WHERE p.status = :status AND p.isActive = true")
    Page<Product> findByStatusAndIsActiveTrue(ProductStatus status, Pageable pageable);

    @Query(value = "SELECT p FROM Product p JOIN FETCH p.seller WHERE p.category = :category AND p.status = :status AND p.isActive = true",
           countQuery = "SELECT COUNT(p) FROM Product p WHERE p.category = :category AND p.status = :status AND p.isActive = true")
    Page<Product> findByCategoryAndStatusAndIsActiveTrue(String category, ProductStatus status, Pageable pageable);

    @Query(value = "SELECT p FROM Product p JOIN FETCH p.seller WHERE p.isActive = true AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')))",
           countQuery = "SELECT COUNT(p) FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Product> search(String q, Pageable pageable);

    @Query(value = "SELECT p FROM Product p JOIN FETCH p.seller WHERE p.seller.id = :sellerId AND p.isActive = true",
           countQuery = "SELECT COUNT(p) FROM Product p WHERE p.seller.id = :sellerId AND p.isActive = true")
    Page<Product> findBySellerIdAndIsActiveTrue(UUID sellerId, Pageable pageable);
}
