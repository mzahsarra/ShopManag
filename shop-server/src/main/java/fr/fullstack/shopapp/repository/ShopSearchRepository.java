package fr.fullstack.shopapp.repository;

import fr.fullstack.shopapp.model.Shop;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.search.engine.search.query.SearchResult;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Repository
public class ShopSearchRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public Page<Shop> search(
            String query,
            Optional<Boolean> inVacations,
            Optional<LocalDate> createdAfter,
            Optional<LocalDate> createdBefore,
            Pageable pageable
    ) {
        SearchSession searchSession = Search.session(entityManager);

        SearchResult<Shop> result = searchSession.search(Shop.class)
                .where(f -> f.bool(b -> {
                    // 1. Recherche Textuelle sur le nom
                    if (query != null && !query.trim().isEmpty()) {
                        b.must(f.match()
                                .field("name")
                                .matching(query)
                                .fuzzy(2)); // Tolérance aux fautes de frappe
                    } else {
                        b.must(f.matchAll());
                    }

                    // 2. Filtre Vacances
                    inVacations.ifPresent(val ->
                            b.filter(f.match().field("inVacations").matching(val))
                    );

                    // 3. Filtre Date (Après)
                    createdAfter.ifPresent(val ->
                            b.filter(f.range().field("createdAt").atLeast(val))
                    );

                    // 4. Filtre Date (Avant)
                    createdBefore.ifPresent(val ->
                            b.filter(f.range().field("createdAt").atMost(val))
                    );
                }))
                .fetch((int) pageable.getOffset(), pageable.getPageSize());

        return new PageImpl<>(result.hits(), pageable, result.total().hitCount());
    }

    public Map<String, Object> getIndexInfo() {
        Map<String, Object> indexInfo = new HashMap<>();
        try {
            SearchSession searchSession = Search.session(entityManager);
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