# Audit accessibilité et SEO

## Vérifications à effectuer

- Valider chaque page publique avec le validateur W3C HTML/CSS.
- Exécuter un audit Lighthouse sur l'accueil, le blog, le portfolio, la
  connexion et le dashboard.
- Vérifier les contrastes, la navigation clavier, les textes alternatifs et
  les liens de navigation.

Le gabarit commun [head.ejs](../views/partials/head.ejs) fournit désormais le
favicon et les métadonnées SEO de chaque page. Les rapports datés W3C et
Lighthouse doivent être exportés après déploiement sur l'URL de recette afin
que les résultats reflètent les ressources réellement servies.
