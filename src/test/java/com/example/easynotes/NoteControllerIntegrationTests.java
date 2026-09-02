package com.example.easynotes;

import com.example.easynotes.repository.NoteRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class NoteControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NoteRepository noteRepository;

    @BeforeEach
    void clearNotes() {
        noteRepository.deleteAll();
    }

    @Test
    void supportsTheCompleteNoteLifecycle() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));

        MvcResult createResult = mockMvc.perform(post("/api/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"First thought\",\"content\":\"Capture the important details.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("First thought"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andReturn();

        JsonNode createdNote = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long noteId = createdNote.get("id").asLong();

        mockMvc.perform(get("/api/notes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(put("/api/notes/{id}", noteId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Refined thought\",\"content\":\"The details are now clearer.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Refined thought"))
                .andExpect(jsonPath("$.content").value("The details are now clearer."));

        mockMvc.perform(delete("/api/notes/{id}", noteId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notes/{id}", noteId))
                .andExpect(status().isNotFound());
    }
}
