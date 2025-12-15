package com.greentechinnovators.backend.marketplace.service;

import com.greentechinnovators.backend.entity.User;
import com.greentechinnovators.backend.gamification.domain.UserGamificationStats;
import com.greentechinnovators.backend.gamification.repository.GamificationStatsRepository;
import com.greentechinnovators.backend.marketplace.domain.MarketplaceOrder;
import com.greentechinnovators.backend.marketplace.domain.OrderStatus;
import com.greentechinnovators.backend.marketplace.domain.Product;
import com.greentechinnovators.backend.marketplace.dto.request.CreateOrderRequestDTO;
import com.greentechinnovators.backend.marketplace.dto.response.OrderResponseDTO;
import com.greentechinnovators.backend.marketplace.repository.MarketplaceOrderRepository;
import com.greentechinnovators.backend.marketplace.repository.ProductRepository;
import com.greentechinnovators.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final MarketplaceOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final GamificationStatsRepository statsRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponseDTO createOrder(String email, CreateOrderRequestDTO request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        UserGamificationStats userStats = statsRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("User stats not found"));

        if (userStats.getTotalPoints() < product.getCostInPoints()) {
            System.out.println("❌ ECHEC: Solde insuffisant !");
            throw new RuntimeException("Insufficient points");
        }

        userStats.setTotalPoints(userStats.getTotalPoints() - product.getCostInPoints());
        statsRepository.save(userStats);

        MarketplaceOrder order = MarketplaceOrder.builder()
                .userId(userStats.getUserId())
                .productId(product.getId())
                .productName(product.getName())
                .costAtPurchase(product.getCostInPoints())
                .status(OrderStatus.PENDING)
                .orderDate(LocalDateTime.now())
                .build();

        MarketplaceOrder savedOrder = orderRepository.save(order);
        return mapToDTO(savedOrder);
    }

    @Transactional
    public OrderResponseDTO updateOrderStatus(String orderId, OrderStatus newStatus) {
        MarketplaceOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (newStatus == OrderStatus.REJECTED && order.getStatus() != OrderStatus.REJECTED) {
            UserGamificationStats userStats = statsRepository.findByUserId(order.getUserId())
                    .orElseThrow(() -> new RuntimeException("User stats not found"));

            userStats.setTotalPoints(userStats.getTotalPoints() + order.getCostAtPurchase());
            statsRepository.save(userStats);
        }

        order.setStatus(newStatus);
        return mapToDTO(orderRepository.save(order));
    }

    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderResponseDTO> getUserOrders(String userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public OrderResponseDTO getOrderDetails(String orderId) {
        return orderRepository.findById(orderId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    // Helper Mapper
    private OrderResponseDTO mapToDTO(MarketplaceOrder order) {
        User user = userRepository.findById(order.getUserId()).orElse(null);
        String userName = (user != null) ? user.getName() : "Unknown";

        return OrderResponseDTO.builder()
                .id(order.getId())
                .productName(order.getProductName())
                .cost(order.getCostAtPurchase())
                .status(order.getStatus())
                .orderDate(order.getOrderDate())
                .userId(order.getUserId())
                .userName(userName)
                .build();
    }
}