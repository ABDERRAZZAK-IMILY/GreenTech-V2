package com.greentechinnovators.backend.marketplace.web;

import com.greentechinnovators.backend.marketplace.domain.OrderStatus;
import com.greentechinnovators.backend.marketplace.dto.request.CreateOrderRequestDTO;
import com.greentechinnovators.backend.marketplace.dto.request.UpdateOrderStatusRequestDTO;
import com.greentechinnovators.backend.marketplace.dto.response.OrderResponseDTO;
import com.greentechinnovators.backend.marketplace.service.MarketplaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @PostMapping("/marketplace/orders")
    public ResponseEntity<OrderResponseDTO> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequestDTO request) {
        String userId = authentication.getName();
        return ResponseEntity.ok(marketplaceService.createOrder(userId, request));
    }

    @GetMapping("/marketplace/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        return ResponseEntity.ok(marketplaceService.getAllOrders());
    }

    @GetMapping("/marketplace/orders/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderDetails(@PathVariable String id) {
        return ResponseEntity.ok(marketplaceService.getOrderDetails(id));
    }

    @GetMapping("/users/{id}/orders")
    public ResponseEntity<List<OrderResponseDTO>> getUserOrders(@PathVariable String id, Authentication authentication) {
        return ResponseEntity.ok(marketplaceService.getUserOrders(id));
    }

    @PutMapping("/marketplace/orders/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable String id,
            @RequestBody UpdateOrderStatusRequestDTO request) {
        return ResponseEntity.ok(marketplaceService.updateOrderStatus(id, request.getStatus()));
    }
}