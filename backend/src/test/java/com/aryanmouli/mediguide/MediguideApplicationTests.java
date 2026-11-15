package com.aryanmouli.mediguide;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * The full application context must load with no GEMINI_API_KEY set —
 * the server has to boot in demo mode. This catches wiring mistakes
 * (e.g. an ambiguous GeminiClient constructor) that the MockBean-based
 * controller test cannot see.
 */
@SpringBootTest
class MediguideApplicationTests {

  @Test
  void contextLoads() {
    // No assertions: a loaded context is the test.
  }
}
