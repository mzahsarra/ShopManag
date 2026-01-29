package fr.fullstack.shopapp.controller;

import fr.fullstack.shopapp.model.Shop;
import fr.fullstack.shopapp.service.ShopService;
import fr.fullstack.shopapp.util.ErrorValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/shops")
public class ShopController {
    @Autowired
    private ShopService service;

    @PostMapping
    public ResponseEntity<Shop> createShop(@Valid @RequestBody Shop shop, Errors errors) throws Exception{
        return ResponseEntity.ok(service.createShop(shop));
    }

    @DeleteMapping("/{id}")
    public HttpStatus deleteShop(@PathVariable long id) throws Exception{
        return HttpStatus.NO_CONTENT;

    }

    @GetMapping
    public ResponseEntity<Page<Shop>> getAllShops(
            Pageable pageable,
            @RequestParam(required = false) Optional<String> sortBy,
            @RequestParam(required = false) Optional<Boolean> inVacations,
            @RequestParam(required = false) Optional<String> createdAfter,
            @RequestParam(required = false) Optional<String> createdBefore,
            @RequestParam(required = false) Optional<String> name
    ) {
        return ResponseEntity.ok(
                service.getShopList(sortBy, inVacations, createdAfter, createdBefore, name, pageable)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shop> getShopById(@PathVariable long id) throws Exception{
       return ResponseEntity.ok().body(service.getShopById(id));
    }

    @PutMapping
    public ResponseEntity<Shop> updateShop(@Valid @RequestBody Shop shop, Errors errors) throws Exception{
        return ResponseEntity.ok().body(service.updateShop(shop));
    }

    @GetMapping("/elasticsearch/indexes")
    public ResponseEntity<Map<String, Object>> getElasticsearchIndexes() {
        Map<String, Object> indexInfo = service.getElasticsearchIndexInfo();
        return ResponseEntity.ok(indexInfo);
    }
}