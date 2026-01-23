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
                        String lowered = queryText.toLowerCase();

                        // Recherche plus stricte :
                        // - phrase match (exact dans l’ordre)
                        // - préfixe (commence par)
                        // - contient (mais seulement si la requête est assez longue)
                        // - fuzzy seulement si la requête est assez longue
                        var sub = f.bool();

                        // 1) Phrase / exact (prioritaire)
                        sub.should(f.phrase()
                                .field("name")
                                .matching(queryText)
                                .boost(5.0f));

                        // 2) Préfixe
                        sub.should(f.wildcard()
                                .field("name")
                                .matching(lowered + "*")
                                .boost(3.0f));

                        // 3) Contient : uniquement si la requête >= 3 caractères
                        if (lowered.length() >= 3) {
                            sub.should(f.wildcard()
                                    .field("name")
                                    .matching("*" + lowered + "*")
                                    .boost(1.5f));
                        }

                        // 4) Fuzzy : uniquement si la requête >= 4 caractères
                        if (lowered.length() >= 4) {
                            sub.should(f.match()
                                    .field("name")
                                    .matching(queryText)
                                    .fuzzy(1)     // ↓ 2 -> 1 (beaucoup moins permissif)
                                    .boost(1.0f));
                        }

                        // IMPORTANT : on exige qu’au moins 1 "should" matche réellement
                        sub.minimumShouldMatchNumber(1);

                        bool.must(sub);
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