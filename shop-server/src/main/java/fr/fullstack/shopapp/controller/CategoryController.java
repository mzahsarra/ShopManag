package fr.fullstack.shopapp.controller;

import fr.fullstack.shopapp.model.Category;
import fr.fullstack.shopapp.service.CategoryService;
import fr.fullstack.shopapp.util.ErrorValidation;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    @Autowired
    private CategoryService service;

    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category, Errors errors) throws Exception {
        return ResponseEntity.ok(service.createCategory(category));
    }


    @DeleteMapping("/{id}")
    public HttpStatus deleteCategory(@PathVariable long id) throws Exception{
        service.deleteCategoryById(id);
        return HttpStatus.NO_CONTENT;
    }


    @GetMapping

    public ResponseEntity<Page<Category>> getAllCategories(Pageable pageable)  {
        return ResponseEntity.ok(service.getCategoryList(pageable));
    }


    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable long id) throws Exception {
        Category category = service.getCategoryById(id);
        return ResponseEntity.ok().body(category);
    }


    @PutMapping
    public ResponseEntity<Category> updateCategory(@Valid @RequestBody Category category, Errors errors) throws Exception{
        return ResponseEntity.ok().body(service.updateCategory(category));
    }
}
