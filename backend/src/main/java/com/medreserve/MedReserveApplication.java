package com.medreserve;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableScheduling
@ComponentScan
@EnableCaching
public class MedReserveApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedReserveApplication.class, args);
    }

}
