package com.sprintiq.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class AiService {

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public AiService(
            @Value("${ai.service.url}") String aiServiceUrl) {

        this.restTemplate = new RestTemplate();
        this.aiServiceUrl = aiServiceUrl;
    }

    public Map<String, Object> predictSprintRisk(
            int totalTasks,
            int completedTasks,
            int inProgressTasks,
            int todoTasks,
            int daysRemaining,
            int highPriorityTasks,
            int mediumPriorityTasks,
            int lowPriorityTasks) {

        Map<String, Object> request = Map.of(
                "totalTasks", totalTasks,
                "completedTasks", completedTasks,
                "inProgressTasks", inProgressTasks,
                "todoTasks", todoTasks,
                "daysRemaining", daysRemaining,
                "highPriorityTasks", highPriorityTasks,
                "mediumPriorityTasks", mediumPriorityTasks,
                "lowPriorityTasks", lowPriorityTasks
        );

        try {
            return restTemplate.postForObject(
                    aiServiceUrl + "/predict/sprint-risk",
                    request,
                    Map.class
            );

        } catch (RestClientException e) {

            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "AI service is currently unavailable"
            );
        }
    }
}