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

import java.util.List;
import java.util.Optional;

@Repository
public class ShopSearchRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Page<Shop> searchByName(Optional<String> q, Optional<Boolean> inVacations, Pageable pageable) {
        SearchSession searchSession = Search.session(entityManager);

        String queryText = q.orElse("").trim();

        SearchResult<Shop> result = searchSession.search(Shop.class)
                .where(f -> {
                    var bool = f.bool();

                    if (queryText.isEmpty()) {
                        bool.must(f.matchAll());
                    } else {
                        // Combiner plusieurs stratégies de recherche
                        bool.must(f.bool()
                                // 1. Match exact (meilleur score)
                                .should(f.match()
                                        .field("name")
                                        .matching(queryText)
                                        .boost(3.0f))
                                // 2. Match avec préfixe
                                .should(f.wildcard()
                                        .field("name")
                                        .matching(queryText.toLowerCase() + "*")
                                        .boost(2.0f))
                                // 3. Match partiel (contient)
                                .should(f.wildcard()
                                        .field("name")
                                        .matching("*" + queryText.toLowerCase() + "*")
                                        .boost(1.0f))
                                // 4. Fuzzy search (tolérance aux fautes)
                                .should(f.match()
                                        .field("name")
                                        .matching(queryText)
                                        .fuzzy(2))
                        );
                    }

                    // Filtre optionnel sur inVacations
                    inVacations.ifPresent(v ->
                            bool.filter(f.match().field("inVacations").matching(v))
                    );

                    return bool;
                })
                .fetch((int) pageable.getOffset(), pageable.getPageSize());

        List<Shop> hits = result.hits();
        long total = result.total().hitCount();

        return new PageImpl<>(hits, pageable, total);
    }
}