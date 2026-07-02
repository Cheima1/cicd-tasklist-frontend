# TaskList — Frontend

Interface web pour la gestion de tâches (application TaskList — entreprise TaskCamel), développée dans le cadre de l'épreuve certifiante BC03 (Piloter l'intégration et le déploiement continu dans le SI).

## Stack technique

- **Framework** : React 19, TypeScript
- **Build tool** : Vite
- **Tests** : Vitest, React Testing Library

## Démarrage local

```bash
npm install
npm run dev
```

## Lancer les tests

```bash
npm test                  # tests unitaires et de composants
npm run test:coverage     # tests + couverture
npm run test:watch        # mode watch
```

## CI/CD

Le pipeline Jenkins (`Jenkinsfile`, à la racine) automatise à chaque commit :

1. Installation des dépendances
2. Tests unitaires et de composants (Vitest + React Testing Library)
3. Analyse de qualité de code (SonarQube) + Quality Gate bloquant
4. Construction de l'image Docker (multi-stage : build Vite puis service statique via Nginx)
5. Scan de sécurité de l'image (Trivy)
6. Génération du SBOM (formats SPDX et CycloneDX)
7. Publication de l'image sur Docker Hub

Le pipeline se déclenche automatiquement (scrutation SCM toutes les 5 minutes) ou manuellement depuis Jenkins.

## Qualité et sécurité

- Configuration SonarQube : voir `sonar-project.properties`
- Aucun secret n'est stocké dans ce dépôt : les credentials (Docker Hub, SonarQube) sont gérés exclusivement via le magasin de credentials Jenkins.

## Docker

```bash
docker build -t tasklist-frontend .
docker run --rm -p 8090:80 tasklist-frontend
```

Puis ouvrir [http://localhost:8090](http://localhost:8090).

Image publiée : [hub.docker.com/r/cheimasterclass/tasklist-frontend](https://hub.docker.com/r/cheimasterclass/tasklist-frontend)

## Structure du projet

```
src/
├── api/            # Appels HTTP vers le backend (taskApi.ts)
├── components/     # Composants React (TaskList, TaskItem, TaskForm)
├── hooks/          # Hooks personnalisés (useTasks)
├── types/          # Types TypeScript partagés
└── __tests__/      # Tests unitaires et de composants
```