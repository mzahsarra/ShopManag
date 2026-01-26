package fr.fullstack.shopapp.service;

import fr.fullstack.shopapp.model.Product;
import fr.fullstack.shopapp.model.Shop;
import fr.fullstack.shopapp.repository.ShopRepository;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ShopService {
    @PersistenceContext
    private EntityManager em;

    @Autowired
    private ShopRepository shopRepository;

    @Transactional
    public Shop createShop(Shop shop) throws Exception {
        try {
            Shop newShop = shopRepository.save(shop);
            // Refresh the entity after the save. Otherwise, @Formula does not work.
            em.flush();
            em.refresh(newShop);
            return newShop;
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    @Transactional
    public void deleteShopById(long id) throws Exception {
        try {
            Shop shop = getShop(id);
            // delete nested relations with products
            deleteNestedRelations(shop);
            shopRepository.deleteById(id);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    public Shop getShopById(long id) throws Exception {
        try {
            return getShop(id);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    public Page<Shop> getShopList(
            Optional<String> sortBy,
            Optional<Boolean> inVacations,
            Optional<String> createdBefore,
            Optional<String> createdAfter,
            Optional<String> name,
            Pageable pageable
    ) {
        if (name.isPresent() && !name.get().trim().isEmpty()) {
            return searchShopsByName(name.get().trim(), inVacations, createdBefore, createdAfter, pageable);
        }
        // SORT
        if (sortBy.isPresent()) {
            switch (sortBy.get()) {
                case "name":
                    return shopRepository.findByOrderByNameAsc(pageable);
                case "createdAt":
                    return shopRepository.findByOrderByCreatedAtAsc(pageable);
                default:
                    return shopRepository.findByOrderByNbProductsAsc(pageable);
            }
        }

        // FILTERS
        Page<Shop> shopList = getShopListWithFilter(inVacations, createdBefore, createdAfter, pageable);
        if (shopList != null) {
            return shopList;
        }

        // NONE
        return shopRepository.findByOrderByIdAsc(pageable);
    }

    @Transactional
    public Shop updateShop(Shop shop) throws Exception {
        try {
            getShop(shop.getId());
            return this.createShop(shop);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    private void deleteNestedRelations(Shop shop) {
        List<Product> products = shop.getProducts();
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            product.setShop(null);
            em.merge(product);
            em.flush();
        }
    }

    private Shop getShop(Long id) throws Exception {
        Optional<Shop> shop = shopRepository.findById(id);
        if (!shop.isPresent()) {
            throw new Exception("Shop with id " + id + " not found");
        }
        return shop.get();
    }

    private Page<Shop> getShopListWithFilter(
            Optional<Boolean> inVacations,
            Optional<String> createdAfter,
            Optional<String> createdBefore,
            Pageable pageable
    ) {
        if (inVacations.isPresent() && createdBefore.isPresent() && createdAfter.isPresent()) {
            return shopRepository.findByInVacationsAndCreatedAtGreaterThanAndCreatedAtLessThan(
                    inVacations.get(),
                    LocalDate.parse(createdAfter.get()),
                    LocalDate.parse(createdBefore.get()),
                    pageable
            );
        }

        if (inVacations.isPresent() && createdBefore.isPresent()) {
            return shopRepository.findByInVacationsAndCreatedAtLessThan(
                    inVacations.get(), LocalDate.parse(createdBefore.get()), pageable
            );
        }

        if (inVacations.isPresent() && createdAfter.isPresent()) {
            return shopRepository.findByInVacationsAndCreatedAtGreaterThan(
                    inVacations.get(), LocalDate.parse(createdAfter.get()), pageable
            );
        }

        if (inVacations.isPresent()) {
            return shopRepository.findByInVacations(inVacations.get(), pageable);
        }

        if (createdBefore.isPresent() && createdAfter.isPresent()) {
            return shopRepository.findByCreatedAtBetween(
                    LocalDate.parse(createdAfter.get()), LocalDate.parse(createdBefore.get()), pageable
            );
        }

        if (createdBefore.isPresent()) {
            return shopRepository.findByCreatedAtLessThan(
                    LocalDate.parse(createdBefore.get()), pageable
            );
        }

        if (createdAfter.isPresent()) {
            return shopRepository.findByCreatedAtGreaterThan(
                    LocalDate.parse(createdAfter.get()), pageable
            );
        }

        return null;
    }
    // Recherche de boutiques par nom en utilisant Hibernate Search (Elasticsearch)
    private Page<Shop> searchShopsByName(
            String searchTerm,
            Optional<Boolean> inVacations,
            Optional<String> createdAfter,
            Optional<String> createdBefore,
            Pageable pageable
    ) {
        try {
            SearchSession searchSession = Search.session(em);
            var searchQuery = searchSession.search(Shop.class)
                    .where(f -> {
                        var nameFuzzy = f.match()
                                .field("name")
                                .matching(searchTerm)
                                .fuzzy(2);

                        if (!inVacations.isPresent() && !createdAfter.isPresent() && !createdBefore.isPresent()) {
                            return nameFuzzy;
                        }
                        var boolQuery = f.bool().must(nameFuzzy);

                        if (inVacations.isPresent()) {
                            boolQuery.must(f.match()
                                    .field("inVacations")
                                    .matching(inVacations.get()));
                        }

                        if (createdAfter.isPresent()) {
                            boolQuery.must(f.range()
                                    .field("createdAt")
                                    .atLeast(LocalDate.parse(createdAfter.get())));
                        }

                        if (createdBefore.isPresent()) {
                            boolQuery.must(f.range()
                                    .field("createdAt")
                                    .atMost(LocalDate.parse(createdBefore.get())));
                        }

                        return boolQuery;
                    });

            var searchResult = searchQuery.fetch((int) pageable.getOffset(), pageable.getPageSize());

            List<Shop> shops = searchResult.hits();
            long totalHits = searchResult.total().hitCount();

            return new PageImpl<>(shops, pageable, totalHits);

        } catch (Exception e) {
            // En cas d'erreur Elasticsearch, fallback sur recherche JPA
            System.err.println("Elasticsearch search failed, falling back to JPA: " + e.getMessage());
            e.printStackTrace();
            return fallbackToJpaSearch(searchTerm, inVacations, createdAfter, createdBefore, pageable);
        }
    }

    /**
     * Fallback sur recherche JPA si Elasticsearch échoue
     */
    private Page<Shop> fallbackToJpaSearch(
            String searchTerm,
            Optional<Boolean> inVacations,
            Optional<String> createdAfter,
            Optional<String> createdBefore,
            Pageable pageable
    ) {
        if (inVacations.isPresent() && createdBefore.isPresent() && createdAfter.isPresent()) {
            return shopRepository.findByNameContainingIgnoreCaseAndInVacationsAndCreatedAtGreaterThanAndCreatedAtLessThan(
                    searchTerm,
                    inVacations.get(),
                    LocalDate.parse(createdAfter.get()),
                    LocalDate.parse(createdBefore.get()),
                    pageable
            );
        }

        if (inVacations.isPresent() && createdBefore.isPresent()) {
            return shopRepository.findByNameContainingIgnoreCaseAndInVacationsAndCreatedAtLessThan(
                    searchTerm, inVacations.get(), LocalDate.parse(createdBefore.get()), pageable
            );
        }

        if (inVacations.isPresent() && createdAfter.isPresent()) {
            return shopRepository.findByNameContainingIgnoreCaseAndInVacationsAndCreatedAtGreaterThan(
                    searchTerm, inVacations.get(), LocalDate.parse(createdAfter.get()), pageable
            );
        }

        if (inVacations.isPresent()) {
            return shopRepository.findByNameContainingIgnoreCaseAndInVacations(
                    searchTerm, inVacations.get(), pageable
            );
        }

        if (createdBefore.isPresent() && createdAfter.isPresent()) {
            return shopRepository.findByNameContainingIgnoreCaseAndCreatedAtBetween(
                    searchTerm,
                    LocalDate.parse(createdAfter.get()),
                    LocalDate.parse(createdBefore.get()),
                    pageable
            );
        }

        if (createdBefore.isPresent()) {
            return shopRepository.findByNameContainingIgnoreCaseAndCreatedAtLessThan(
                    searchTerm, LocalDate.parse(createdBefore.get()), pageable
            );
        }

        if (createdAfter.isPresent()) {
            return shopRepository.findByNameContainingIgnoreCaseAndCreatedAtGreaterThan(
                    searchTerm, LocalDate.parse(createdAfter.get()), pageable
            );
        }

        return shopRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
    }

    public Map<String, Object> getElasticsearchIndexInfo() {
        Map<String, Object> indexInfo = new HashMap<>();
        try {
            SearchSession searchSession = Search.session(em);
            long documentCount = searchSession.search(Shop.class)
                    .where(f -> f.matchAll())
                    .fetchTotalHitCount();

            indexInfo.put("indexName", "idx_shops");
            indexInfo.put("documentCount", documentCount);
            indexInfo.put("status", "active");
        } catch (Exception e) {
            indexInfo.put("indexName", "idx_shops");
            indexInfo.put("documentCount", -1);
            indexInfo.put("status", "error");
            indexInfo.put("error", e.getMessage());
        }
        return indexInfo;
    }
}
