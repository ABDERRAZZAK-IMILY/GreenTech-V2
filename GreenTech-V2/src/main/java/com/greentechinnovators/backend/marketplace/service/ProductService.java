package com.greentechinnovators.backend.marketplace.service;

import com.greentechinnovators.backend.marketplace.domain.Product;
import com.greentechinnovators.backend.marketplace.dto.request.ProductRequestDTO;
import com.greentechinnovators.backend.marketplace.dto.response.ProductResponseDTO;
import com.greentechinnovators.backend.marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

   
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .filter(Product::isActive)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

  
    public ProductResponseDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return mapToDTO(product);
    }

    
    public List<ProductResponseDTO> getProductsByCategory(String category) {
        return productRepository.findAll().stream()
                .filter(p -> p.isActive() && category.equalsIgnoreCase(p.getCategory()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

  
    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .costInPoints(request.getCostInPoints())
                .imageUrl(request.getImageUrl())
                .stockQuantity(request.getStockQuantity())
                .category(request.getCategory())
                .rating(request.getRating() != null ? request.getRating() : 0.0)
                .isActive(true)
                .build();

        Product savedProduct = productRepository.save(product);
        return mapToDTO(savedProduct);
    }

  
    public ProductResponseDTO updateProduct(String id, ProductRequestDTO request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCostInPoints(request.getCostInPoints());
        product.setImageUrl(request.getImageUrl());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(request.getCategory());
        
        if (request.getRating() != null) {
            product.setRating(request.getRating());
        }

        Product updatedProduct = productRepository.save(product);
        return mapToDTO(updatedProduct);
    }

   
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        product.setActive(false);
        productRepository.save(product);
    }

   
    private ProductResponseDTO mapToDTO(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .costInPoints(product.getCostInPoints())
                .imageUrl(product.getImageUrl())
                .stockQuantity(product.getStockQuantity())
                .isActive(product.isActive())
                .category(product.getCategory())
                .rating(product.getRating())
                .build();
    }
}
