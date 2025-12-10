package com.greentechinnovators.backend.gamification.service;

import com.greentechinnovators.backend.gamification.domain.Challenge;
import com.greentechinnovators.backend.gamification.domain.ChallengeSubmission;
import com.greentechinnovators.backend.gamification.domain.SubmissionStatus;
import com.greentechinnovators.backend.gamification.dto.request.SubmitChallengeRequestDTO;
import com.greentechinnovators.backend.gamification.dto.response.SubmissionResponseDTO;
import com.greentechinnovators.backend.gamification.repository.ChallengeRepository;
import com.greentechinnovators.backend.gamification.repository.ChallengeSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChallengeSubmissionService {

    private final ChallengeSubmissionRepository submissionRepository;
    private final ChallengeRepository challengeRepository;
    private final GamificationService gamificationService;

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
     * Get user submissions with detailed information
     */
    public List<SubmissionResponseDTO> getUserSubmissionsDetailed(String userId) {
        List<ChallengeSubmission> submissions = submissionRepository.findByUserId(userId);
        
        return submissions.stream().map(submission -> {
            Challenge challenge = challengeRepository.findById(submission.getChallengeId())
                    .orElse(null);
            
            return SubmissionResponseDTO.builder()
                    .id(submission.getId())
                    .challengeId(submission.getChallengeId())
                    .challengeTitle(challenge != null ? challenge.getTitle() : "Unknown Challenge")
                    .proofImageUrl(submission.getProofImageUrl())
                    .status(submission.getStatus())
                    .submissionDate(submission.getSubmissionDate())
                    .adminComment(submission.getAdminComment())
                    .pointsAwarded(challenge != null && submission.getStatus() == SubmissionStatus.APPROVED 
                            ? challenge.getPointsReward() : 0)
                    .build();
        }).collect(Collectors.toList());
    }
}