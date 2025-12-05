package com.medreserve.repository;

import com.medreserve.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findByChatSessionId(Long chatSessionId);
    
    Page<ChatMessage> findByChatSessionId(Long chatSessionId, Pageable pageable);
    
    List<ChatMessage> findByChatSessionIdOrderBySentAtAsc(Long chatSessionId);
    
    Page<ChatMessage> findByChatSessionIdOrderBySentAtDesc(Long chatSessionId, Pageable pageable);
    
    List<ChatMessage> findBySenderId(Long senderId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatSession.id = :chatSessionId AND cm.sender.id = :senderId ORDER BY cm.sentAt ASC")
    List<ChatMessage> findByChatSessionAndSender(@Param("chatSessionId") Long chatSessionId, @Param("senderId") Long senderId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatSession.id = :chatSessionId AND cm.status != 'READ' AND cm.sender.id != :userId")
    List<ChatMessage> findUnreadMessages(@Param("chatSessionId") Long chatSessionId, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.chatSession.id = :chatSessionId AND cm.status != 'READ' AND cm.sender.id != :userId")
    long countUnreadMessages(@Param("chatSessionId") Long chatSessionId, @Param("userId") Long userId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatSession.id = :chatSessionId AND cm.sentAt BETWEEN :startTime AND :endTime ORDER BY cm.sentAt ASC")
    List<ChatMessage> findByChatSessionAndTimeRange(@Param("chatSessionId") Long chatSessionId, 
                                                   @Param("startTime") LocalDateTime startTime, 
                                                   @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatSession.id = :chatSessionId AND " +
           "LOWER(cm.messageContent) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY cm.sentAt ASC")
    List<ChatMessage> searchMessagesByKeyword(@Param("chatSessionId") Long chatSessionId, @Param("keyword") String keyword);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.messageType = :messageType")
    List<ChatMessage> findByMessageType(@Param("messageType") ChatMessage.MessageType messageType);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatSession.id = :chatSessionId AND cm.messageType = :messageType")
    List<ChatMessage> findByChatSessionAndMessageType(@Param("chatSessionId") Long chatSessionId, 
                                                     @Param("messageType") ChatMessage.MessageType messageType);
    
    @Modifying
    @Query("UPDATE ChatMessage cm SET cm.status = 'DELIVERED', cm.deliveredAt = :deliveredAt WHERE cm.id IN :messageIds")
    void markMessagesAsDelivered(@Param("messageIds") List<Long> messageIds, @Param("deliveredAt") LocalDateTime deliveredAt);
    
    @Modifying
    @Query("UPDATE ChatMessage cm SET cm.status = 'READ', cm.readAt = :readAt WHERE cm.id IN :messageIds")
    void markMessagesAsRead(@Param("messageIds") List<Long> messageIds, @Param("readAt") LocalDateTime readAt);
    
    @Modifying
    @Query("UPDATE ChatMessage cm SET cm.status = 'READ', cm.readAt = :readAt WHERE cm.chatSession.id = :chatSessionId AND cm.sender.id != :userId AND cm.status != 'READ'")
    void markAllMessagesAsRead(@Param("chatSessionId") Long chatSessionId, @Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatSession.id = :chatSessionId ORDER BY cm.sentAt DESC")
    Page<ChatMessage> findLatestMessages(@Param("chatSessionId") Long chatSessionId, Pageable pageable);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.chatSession.id = :chatSessionId")
    long countByChatSessionId(@Param("chatSessionId") Long chatSessionId);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.sender.id = :senderId")
    long countBySenderId(@Param("senderId") Long senderId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.createdAt < :cutoffDate")
    List<ChatMessage> findOldMessages(@Param("cutoffDate") LocalDateTime cutoffDate);
}
