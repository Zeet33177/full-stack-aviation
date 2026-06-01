package com.horizon.airways;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AirwaysApplication {
    public static void main(String[] args) {
        SpringApplication.run(AirwaysApplication.class, args);
    }
}
