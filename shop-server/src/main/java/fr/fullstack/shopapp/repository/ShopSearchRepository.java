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
            Optional<String> sortBy,
            Pageable pageable
    ) {
        SearchSession searchSession = Search.session(entityManager);

        SearchResult<Shop> result = searchSession.search(Shop.class)
                .where(f -> f.bool(b -> {
                    if (query != null && !query.trim().isEmpty()) {
                        b.must(f.match().field("name").matching(query).fuzzy(2));
                    } else {
                        b.must(f.matchAll());
                    }
                    inVacations.ifPresent(val -> b.filter(f.match().field("inVacations").matching(val)));
                    createdAfter.ifPresent(val -> b.filter(f.range().field("createdAt").atLeast(val)));
                    createdBefore.ifPresent(val -> b.filter(f.range().field("createdAt").atMost(val)));
                }))
                .sort(f -> {
                    if (sortBy.isPresent()) {
                        switch (sortBy.get()) {
                            case "name": return f.field("name_sort").asc();
                            case "createdAt": return f.field("createdAt").asc();
                            case "nbProducts": return f.field("nbProducts").asc();
                        }
                    }
                    return f.score();
                })
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