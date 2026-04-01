package com.ufam.uforum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class UForumApplication {
    public static void main(String[] args) {
        SpringApplication.run(UForumApplication.class, args);
    }
}
