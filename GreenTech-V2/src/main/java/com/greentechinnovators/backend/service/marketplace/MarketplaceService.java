package com.greentechinnovators.backend.service.marketplace;

import com.greentechinnovators.backend.entity.User;
import com.greentechinnovators.backend.entity.gamification.UserGamificationStats;
import com.greentechinnovators.backend.repository.gamification.GamificationStatsRepository;
import com.greentechinnovators.backend.entity.marketplace.MarketplaceOrder;
import com.greentechinnovators.backend.Enums.marketplace.OrderStatus;
import com.greentechinnovators.backend.entity.marketplace.Product;
import com.greentechinnovators.backend.dto.marketplace.request.CreateOrderRequestDTO;
import com.greentechinnovators.backend.dto.marketplace.response.OrderResponseDTO;
import com.greentechinnovators.backend.repository.marketplace.MarketplaceOrderRepository;
import com.greentechinnovators.backend.repository.marketplace.ProductRepository;
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

    private OrderResponseDTO mapToDTO(MarketplaceOrder order) {
        String userName = null;
        String oderId = order.getUserId();
        
        if (oderId != null && oderId.contains("@")) {
            User user = userRepository.findByEmail(oderId).orElse(null);
            if (user != null && user.getName() != null) {
                userName = user.getName();
            }
        } else {
            UserGamificationStats stats = statsRepository.findByUserId(oderId).orElse(null);
            
            if (stats != null && stats.getUserEmail() != null) {
                User user = userRepository.findByEmail(stats.getUserEmail()).orElse(null);
                if (user != null && user.getName() != null) {
                    userName = user.getName();
                }
            }
            
            if (userName == null) {
                User user = userRepository.findById(oderId).orElse(null);
                if (user != null && user.getName() != null) {
                    userName = user.getName();
                }
            }
        }
        
        if (userName == null || userName.isEmpty()) {
            userName = "Utilisateur";
        }

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