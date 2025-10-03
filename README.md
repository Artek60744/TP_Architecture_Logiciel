# Guide des Releases GitHub Actions

Ce projet utilise GitHub Actions pour automatiser la création de releases multi-plateformes.

## 📋 Comment créer une release

### Méthode 1: Avec un tag Git (Recommandée)

1. **Créer et pousser un tag de version :**

```bash
git tag v1.0.0
git push origin v1.0.0
```

2. **Le workflow se déclenche automatiquement** et :
    - Compile l'application pour Windows, macOS et Linux
    - Crée une release GitHub avec tous les binaires
    - Génère automatiquement les notes de release

### Méthode 2: Déclenchement manuel

1. Aller sur GitHub → Actions → Release workflow
2. Cliquer sur "Run workflow"
3. Sélectionner la branche et lancer

## 🏗️ Que fait le workflow ?

### Job `build` (En parallèle sur 3 OS)

- **macOS** : Compile avec `npm run build:mac`
- **Linux** : Compile avec `npm run build:linux`
- **Windows** : Compile avec `npm run build:win`


### Job `release` (Si tag de version)

- Télécharge tous les artifacts
- Crée une release GitHub
- Attache tous les binaires à la release


## 📁 Structure des artifacts

```
releases/
├── Navigateur-1.0.0.dmg           # macOS
├── Navigateur-1.0.0.AppImage      # Linux
├── Navigateur Setup 1.0.0.exe    # Windows
└── ...
```


## 🔧 Configuration requise

Le workflow fonctionne immédiatement sans configuration supplémentaire. Les permissions GitHub sont automatiquement gérées.

## 📝 Nomenclature des versions

Utilisez le format [SemVer](https://semver.org/) :

- `v1.0.0` - Version majeure
- `v1.0.1` - Correction de bugs
- `v1.1.0` - Nouvelles fonctionnalités
- `v2.0.0` - Changements incompatibles


## 🚀 Exemples de commandes

```bash
# Première release
git tag v1.0.0
git push origin v1.0.0

# Correction de bug
git tag v1.0.1 
git push origin v1.0.1

# Nouvelle fonctionnalité
git tag v1.1.0
git push origin v1.1.0
```


## ⚠️ Notes importantes

- Les builds prennent environ 10-15 minutes par plateforme
- Seuls les tags commençant par 'v' déclenchent une release
- Les artifacts sont conservés 30 jours sur GitHub Actions
- La signature de code macOS nécessiterait des certificats (optionnel)

Voici une nouvelle version du README avec les mêmes éléments mais présentés différemment :

# Documentation des Releases via GitHub Actions

Ce projet intègre GitHub Actions pour automatiser la génération de releases compatibles avec plusieurs systèmes d’exploitation.

***

## Comment lancer une release

### Option 1 : Utilisation d’un tag Git (préférée)

1. Créez un tag correspondant à la version souhaitée puis poussez-le vers le dépôt :

```bash
git tag v1.0.0
git push origin v1.0.0
```

2. Ce push déclenche automatiquement le workflow qui :
    - Compile l’application pour Windows, macOS et Linux
    - Génère une release GitHub incluant tous les fichiers binaires
    - Rédige automatiquement les notes de publication

### Option 2 : Lancement manuel du workflow

1. Rendez-vous dans l’onglet Actions du dépôt GitHub, puis sélectionnez le workflow de release
2. Cliquez sur « Run workflow »
3. Choisissez la branche et lancez l’exécution

***

## Description du workflow

### Phase de compilation (`build`)

Ce job s’exécute en parallèle sur trois environnements différents :

- macOS, compiling via `npm run build:mac`
- Linux, compiling via `npm run build:linux`
- Windows, compiling via `npm run build:win`


### Phase de release (`release`)

Déclenchée uniquement lorsqu’un tag de version est détecté, elle :

- Télécharge tous les fichiers générés
- Crée une release GitHub associée à ce tag
- Attache les binaires correspondants à la release

***

## Organisation des fichiers générés (artifacts)

```
releases/
├── Navigateur-1.0.0.dmg           (macOS)
├── Navigateur-1.0.0.AppImage      (Linux)
├── Navigateur Setup 1.0.0.exe     (Windows)
└── ...
```


***

## Prérequis

Aucune configuration additionnelle n’est requise : les permissions nécessaires sont automatiquement gérées par GitHub Actions dès l’activation du workflow.

***

## Convention de versionnage

Il est recommandé d’utiliser la norme [SemVer](https://semver.org/) :

- `v1.0.0` pour les versions majeures
- `v1.0.1` pour les corrections de bugs
- `v1.1.0` pour l’ajout de nouvelles fonctionnalités
- `v2.0.0` pour des changements incompatibles avec les versions précédentes

***

## Commandes d’exemple

```bash
# Création de la première release
git tag v1.0.0
git push origin v1.0.0

# Correction de bug
git tag v1.0.1 
git push origin v1.0.1

# Ajout d’une nouvelle fonctionnalité
git tag v1.1.0
git push origin v1.1.0
```


***

## Informations complémentaires

- Le temps de compilation est d’environ 10 à 15 minutes par plateforme
- Seuls les tags précédés de « v » déclenchent une release automatiquement
- Les fichiers d’artifacts sont conservés pendant 30 jours sur GitHub Actions
- La signature de code pour macOS nécessite des certificats spécifiques (optionnel)

***

Cette présentation clarifie chaque étape tout en conservant la totalité des informations essentielles.

