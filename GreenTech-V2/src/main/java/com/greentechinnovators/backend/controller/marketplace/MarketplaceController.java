package com.greentechinnovators.backend.controller.marketplace;

import com.greentechinnovators.backend.entity.User;
import com.greentechinnovators.backend.dto.marketplace.request.CreateOrderRequestDTO;
import com.greentechinnovators.backend.dto.marketplace.request.UpdateOrderStatusRequestDTO;
import com.greentechinnovators.backend.dto.marketplace.response.OrderResponseDTO;
import com.greentechinnovators.backend.service.marketplace.MarketplaceService;
import com.greentechinnovators.backend.repository.UserRepository;
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
    private final UserRepository userRepository;

    @PostMapping("/marketplace/orders")
    public ResponseEntity<OrderResponseDTO> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequestDTO request) {
        String email = authentication.getName();
        return ResponseEntity.ok(marketplaceService.createOrder(email, request));
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

    @GetMapping("/marketplace/my-orders")
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String realUserId = user.getId();

        return ResponseEntity.ok(marketplaceService.getUserOrders(realUserId));
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