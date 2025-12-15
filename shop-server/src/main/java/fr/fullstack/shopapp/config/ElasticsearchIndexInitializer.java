package fr.fullstack.shopapp.config;

import fr.fullstack.shopapp.model.Shop;

import jakarta.persistence.EntityManager;

import jakarta.persistence.PersistenceContext;

import org.hibernate.search.mapper.orm.Search;

import org.hibernate.search.mapper.orm.massindexing.MassIndexer;

import org.hibernate.search.mapper.orm.session.SearchSession;

import org.slf4j.Logger;

import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import org.springframework.context.ApplicationListener;

import org.springframework.context.event.ContextRefreshedEvent;

import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Transactional;

@Component

@ConditionalOnProperty(name = "elasticsearch.reindex.on.startup", havingValue = "true", matchIfMissing = true)

public class ElasticsearchIndexInitializer implements ApplicationListener<ContextRefreshedEvent> {

    private static final Logger logger = LoggerFactory.getLogger(ElasticsearchIndexInitializer.class);

    private static boolean alreadyChecked = false;

    @PersistenceContext

    private EntityManager entityManager;

    @Value("${elasticsearch.reindex.on.startup:true}")

    private String reindexProperty;

    @Override

    @Transactional

    public void onApplicationEvent(ContextRefreshedEvent event) {

        // Prevent multiple executions in case of context refresh
        System.out.println("BEGIN INDEXING CALLBACK");

        if (alreadyChecked) {

            return;

        }

        alreadyChecked = true;

        try {

            SearchSession searchSession = Search.session(entityManager);

            

            // Check if index is empty or doesn't exist

            long documentCount = searchSession.search(Shop.class)

                    .where(f -> f.matchAll())

                    .fetchTotalHitCount();

            

            if (documentCount == 0) {
                System.out.println("DOCUMENT_COUNT=0");

                logger.info("Elasticsearch index for Shop entities is empty. Starting reindexing...");

                

                MassIndexer indexer = searchSession.massIndexer(Shop.class)

                        .threadsToLoadObjects(2)

                        .batchSizeToLoadObjects(25);

                

                indexer.startAndWait();

                

                logger.info("Successfully completed Elasticsearch reindexing for Shop entities.");

            } else {

                logger.info("Elasticsearch index for Shop entities already contains {} documents. Skipping reindexing.", documentCount);

            }

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            logger.error("Elasticsearch reindexing was interrupted", e);

        } catch (Exception e) {

            logger.warn("Could not check Elasticsearch index. Attempting to reindex...", e);

            try {

                SearchSession searchSession = Search.session(entityManager);

                MassIndexer indexer = searchSession.massIndexer(Shop.class)

                        .threadsToLoadObjects(2)

                        .batchSizeToLoadObjects(25);

                

                indexer.startAndWait();

                

                logger.info("Successfully completed Elasticsearch reindexing for Shop entities.");

            } catch (InterruptedException ie) {

                Thread.currentThread().interrupt();

                logger.error("Elasticsearch reindexing was interrupted", ie);

            } catch (Exception reindexException) {

                logger.error("Error during Elasticsearch reindexing", reindexException);

            }

        }

    }

}

