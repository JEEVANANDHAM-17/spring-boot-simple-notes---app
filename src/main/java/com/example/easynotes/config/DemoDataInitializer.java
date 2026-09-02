package com.example.easynotes.config;

import com.example.easynotes.model.Note;
import com.example.easynotes.repository.NoteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.Arrays;

@Configuration
@Profile("render")
public class DemoDataInitializer {

    @Bean
    CommandLineRunner seedDemoNotes(NoteRepository noteRepository) {
        return args -> {
            if (noteRepository.count() > 0) {
                return;
            }

            noteRepository.saveAll(Arrays.asList(
                    note(
                            "Ideas for the portfolio case study",
                            "Show the problem, the design decisions, and the API integration. Keep the story focused on outcomes."
                    ),
                    note(
                            "Books to revisit",
                            "The Design of Everyday Things, Steal Like an Artist, and Refactoring UI."
                    ),
                    note(
                            "A better morning routine",
                            "Start with a short walk, make coffee, then spend the first hour on the most important work."
                    )
            ));
        };
    }

    private Note note(String title, String content) {
        Note note = new Note();
        note.setTitle(title);
        note.setContent(content);
        return note;
    }
}
