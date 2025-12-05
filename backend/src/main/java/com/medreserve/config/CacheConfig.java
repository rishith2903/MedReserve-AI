package com.medreserve.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;
import java.util.Arrays;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();

        CaffeineCache mlSpecialties = new CaffeineCache(
                "mlSpecialties",
                Caffeine.newBuilder().expireAfterWrite(10, TimeUnit.MINUTES).maximumSize(200).build()
        );
        CaffeineCache chatbotIntents = new CaffeineCache(
                "chatbotIntents",
                Caffeine.newBuilder().expireAfterWrite(10, TimeUnit.MINUTES).maximumSize(200).build()
        );
        CaffeineCache serviceHealth = new CaffeineCache(
                "serviceHealth",
                Caffeine.newBuilder().expireAfterWrite(30, TimeUnit.SECONDS).maximumSize(200).build()
        );
        CaffeineCache doctorById = new CaffeineCache(
                "doctorById",
                Caffeine.newBuilder().expireAfterWrite(10, TimeUnit.MINUTES).maximumSize(2000).build()
        );
        CaffeineCache doctorByUserId = new CaffeineCache(
                "doctorByUserId",
                Caffeine.newBuilder().expireAfterWrite(10, TimeUnit.MINUTES).maximumSize(2000).build()
        );
        CaffeineCache doctorSpecialties = new CaffeineCache(
                "doctorSpecialties",
                Caffeine.newBuilder().expireAfterWrite(10, TimeUnit.MINUTES).maximumSize(100).build()
        );
        CaffeineCache doctorList = new CaffeineCache(
                "doctorList",
                Caffeine.newBuilder().expireAfterWrite(2, TimeUnit.MINUTES).maximumSize(5000).build()
        );
        CaffeineCache availableSlots = new CaffeineCache(
                "availableSlots",
                Caffeine.newBuilder().expireAfterWrite(60, TimeUnit.SECONDS).maximumSize(10000).build()
        );
        CaffeineCache patientReportsPage = new CaffeineCache(
                "patientReportsPage",
                Caffeine.newBuilder().expireAfterWrite(60, TimeUnit.SECONDS).maximumSize(5000).build()
        );

        manager.setCaches(Arrays.asList(
                mlSpecialties,
                chatbotIntents,
                serviceHealth,
                doctorById,
                doctorByUserId,
                doctorSpecialties,
                doctorList,
                availableSlots,
                patientReportsPage
        ));
        return manager;
    }
}
