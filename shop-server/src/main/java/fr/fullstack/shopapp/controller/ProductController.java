package fr.fullstack.shopapp.controller;

import fr.fullstack.shopapp.model.Product;
import fr.fullstack.shopapp.service.ProductService;
import fr.fullstack.shopapp.util.ErrorValidation;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    @Autowired
    private ProductService service;


    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product, Errors errors) throws Exception{
        return ResponseEntity.ok(service.createProduct(product));
    }


    @DeleteMapping("/{id}")
    public HttpStatus deleteProduct(@PathVariable long id) throws Exception{
        service.deleteProductById(id);
        return HttpStatus.NO_CONTENT;
    }


    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable long id) throws Exception{
        return ResponseEntity.ok().body(service.getProductById(id));
    }


    @GetMapping

    public ResponseEntity<Page<Product>> getProductsOfShop(
            Pageable pageable,
            @RequestParam Optional<Long> shopId,
            @RequestParam Optional<Long> categoryId
    ) {
        return ResponseEntity.ok(
                service.getShopProductList(shopId, categoryId, pageable)
        );
    }


    @PutMapping
    public ResponseEntity<Product> updateProduct(@Valid @RequestBody Product product, Errors errors) throws Exception{
        return ResponseEntity.ok().body(service.updateProduct(product));
    }
}
