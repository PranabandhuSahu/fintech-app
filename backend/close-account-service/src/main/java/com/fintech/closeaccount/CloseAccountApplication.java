package com.fintech.closeaccount;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class CloseAccountApplication {

    public static void main(String[] args) {
        SpringApplication.run(CloseAccountApplication.class, args);
    }
}
