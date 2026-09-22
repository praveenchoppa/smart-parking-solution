package com.smartparking.backend.ai.ai1.bootstrap;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.ai1.demo-bootstrap.enabled", havingValue = "true", matchIfMissing = true)
public class Ai1DemoBootstrap implements ApplicationRunner {

    private final Ai1DemoBootstrapService ai1DemoBootstrapService;

    @Override
    public void run(ApplicationArguments args) {
        ai1DemoBootstrapService.ensureDemoParkingArea();
    }
}
