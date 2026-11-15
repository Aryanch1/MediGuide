package com.aryanmouli.mediguide;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ExplainControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper mapper;

  @MockBean private AiExplainer explainer;

  @Test
  void liveExplanationIsReturned() throws Exception {
    var live = new ExplainDtos.Explanation(
        "live-amoxicillin-1",
        "Amoxicillin 500 mg",
        "Amoxicillin 500 mg capsules. Take one capsule three times daily.",
        "tablets",
        "An antibiotic that kills bacteria.",
        "Take 1 capsule 3 times a day with water.",
        List.of("Finish the whole course."),
        List.of("08:00", "14:00", "20:00"),
        "1 capsule",
        "live",
        1L);
    when(explainer.explain(anyString())).thenReturn(live);

    mockMvc.perform(post("/api/explain")
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(
                new ExplainDtos.ExplainRequest("Amoxicillin 500 mg capsules. Take one capsule three times daily."))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.explanation.medicineName").value("Amoxicillin 500 mg"))
        .andExpect(jsonPath("$.explanation.source").value("live"))
        .andExpect(jsonPath("$.explanation.schedule[0]").value("08:00"))
        .andExpect(jsonPath("$.explanation.schedule[2]").value("20:00"));
  }

  @Test
  void emptyLabelIsRejected() throws Exception {
    mockMvc.perform(post("/api/explain")
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(new ExplainDtos.ExplainRequest("   "))))
        .andExpect(status().isBadRequest());
  }

  @Test
  void aiFailureFallsBackToDemoExplanation() throws Exception {
    when(explainer.explain(anyString())).thenThrow(new IllegalStateException("Gemini down"));

    mockMvc.perform(post("/api/explain")
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(
                new ExplainDtos.ExplainRequest("Metformin 500 mg tablets. Take 1 tablet twice daily with meals."))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.explanation.source").value("demo"))
        .andExpect(jsonPath("$.explanation.schedule[0]").value("08:00"))
        .andExpect(jsonPath("$.explanation.schedule[1]").value("20:00"));
  }
}
