package com.greentechinnovators.backend.gamification.service;

import com.greentechinnovators.backend.gamification.domain.Challenge;
import com.greentechinnovators.backend.gamification.domain.ChallengeSubmission;
import com.greentechinnovators.backend.gamification.domain.SubmissionStatus;
import com.greentechinnovators.backend.gamification.dto.request.SubmitChallengeRequestDTO;
import com.greentechinnovators.backend.gamification.dto.response.SubmissionResponseDTO;
import com.greentechinnovators.backend.gamification.repository.ChallengeRepository;
import com.greentechinnovators.backend.gamification.repository.ChallengeSubmissionRepository;
import com.greentechinnovators.backend.repository.UserRepository;
import com.greentechinnovators.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChallengeSubmissionService {

    private final ChallengeSubmissionRepository submissionRepository;
    private final ChallengeRepository challengeRepository;
    private final GamificationService gamificationService;
    private final UserRepository userRepository;

    public ChallengeSubmission submitProof(String userId, SubmitChallengeRequestDTO request) {
        if (!challengeRepository.existsById(request.getChallengeId())) {
            throw new RuntimeException("Challenge not found");
        }

        ChallengeSubmission submission = ChallengeSubmission.builder()
                .userId(userId)
                .challengeId(request.getChallengeId())
                .proofImageUrl(request.getProofImageUrl())
                .status(SubmissionStatus.PENDING)
                .submissionDate(LocalDateTime.now())
                .build();

        return submissionRepository.save(submission);
    }

    @Transactional
    public ChallengeSubmission validateSubmission(String submissionId, SubmissionStatus newStatus, String comment) {
        ChallengeSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new RuntimeException("Submission is already validated");
        }

        submission.setStatus(newStatus);
        submission.setAdminComment(comment);

        if (newStatus == SubmissionStatus.APPROVED) {
            Challenge challenge = challengeRepository.findById(submission.getChallengeId())
                    .orElseThrow(() -> new RuntimeException("Challenge not found associated with submission"));

            gamificationService.addPoints(submission.getUserId(), challenge.getPointsReward());
        }

        return submissionRepository.save(submission);
    }

    public List<ChallengeSubmission> getPendingSubmissions() {
        return submissionRepository.findByStatus(SubmissionStatus.PENDING);
    }

    public List<ChallengeSubmission> getUserSubmissions(String userId) {
        return submissionRepository.findByUserId(userId);
    }

    /**
     * Get all submissions with detailed information (Admin)
     */
    public List<SubmissionResponseDTO> getAllSubmissionsDetailed() {
        List<ChallengeSubmission> submissions = submissionRepository.findAll();
        return mapSubmissionsToDTO(submissions);
    }

    /**
     * Get pending submissions with detailed information (Admin)
     */
    public List<SubmissionResponseDTO> getPendingSubmissionsDetailed() {
        List<ChallengeSubmission> submissions = submissionRepository.findByStatus(SubmissionStatus.PENDING);
        return mapSubmissionsToDTO(submissions);
    }

    /**
     * Get submissions statistics for dashboard
     */
    public Map<String, Object> getSubmissionsStats() {
        List<ChallengeSubmission> allSubmissions = submissionRepository.findAll();
        
        long totalCount = allSubmissions.size();
        long pendingCount = allSubmissions.stream().filter(s -> s.getStatus() == SubmissionStatus.PENDING).count();
        long approvedCount = allSubmissions.stream().filter(s -> s.getStatus() == SubmissionStatus.APPROVED).count();
        long rejectedCount = allSubmissions.stream().filter(s -> s.getStatus() == SubmissionStatus.REJECTED).count();
        
        // Calculate total points awarded
        int totalPointsAwarded = allSubmissions.stream()
                .filter(s -> s.getStatus() == SubmissionStatus.APPROVED)
                .mapToInt(s -> {
                    Challenge challenge = challengeRepository.findById(s.getChallengeId()).orElse(null);
                    return challenge != null ? challenge.getPointsReward() : 0;
                })
                .sum();

        // Find most active user
        Map<String, Long> userSubmissionCounts = allSubmissions.stream()
                .collect(Collectors.groupingBy(ChallengeSubmission::getUserId, Collectors.counting()));
        
        String mostActiveUserId = userSubmissionCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
        
        String mostActiveUserName = "N/A";
        long mostActiveUserCount = 0;
        if (mostActiveUserId != null) {
            User user = userRepository.findById(mostActiveUserId).orElse(null);
            mostActiveUserName = user != null ? user.getName() : "Unknown";
            mostActiveUserCount = userSubmissionCounts.get(mostActiveUserId);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalActions", totalCount);
        stats.put("pendingCount", pendingCount);
        stats.put("approvedCount", approvedCount);
        stats.put("rejectedCount", rejectedCount);
        stats.put("totalPointsAwarded", totalPointsAwarded);
        stats.put("mostActiveUser", Map.of(
            "name", mostActiveUserName,
            "count", mostActiveUserCount
        ));
        
        return stats;
    }

    /**
     * Get user submissions with detailed information
     */
    public List<SubmissionResponseDTO> getUserSubmissionsDetailed(String userId) {
        List<ChallengeSubmission> submissions = submissionRepository.findByUserId(userId);
        if (submissions == null || submissions.isEmpty()) {
            return List.of();
        }
        return mapSubmissionsToDTO(submissions);
    }

    private List<SubmissionResponseDTO> mapSubmissionsToDTO(List<ChallengeSubmission> submissions) {
        if (submissions == null || submissions.isEmpty()) {
            return List.of();
        }
        return submissions.stream().map(submission -> {
            Challenge challenge = null;
            try {
                challenge = challengeRepository.findById(submission.getChallengeId()).orElse(null);
            } catch (Exception e) {
                // Challenge not found, continue with null
            }
            
            // Get user name
            String userName = "Unknown User";
            try {
                User user = userRepository.findById(submission.getUserId()).orElse(null);
                if (user != null) {
                    userName = user.getName();
                }
            } catch (Exception e) {
                // User not found, use default name
            }
            
            return SubmissionResponseDTO.builder()
                    .id(submission.getId())
                    .userId(submission.getUserId())
                    .userName(userName)
                    .challengeId(submission.getChallengeId())
                    .challengeTitle(challenge != null ? challenge.getTitle() : "Unknown Challenge")
                    .challengeCategory(challenge != null ? challenge.getCategory() : "Unknown")
                    .proofImageUrl(submission.getProofImageUrl())
                    .status(submission.getStatus())
                    .submissionDate(submission.getSubmissionDate())
                    .adminComment(submission.getAdminComment())
                    .pointsAwarded(challenge != null ? challenge.getPointsReward() : 0)
                    .build();
        }).collect(Collectors.toList());
    }
}