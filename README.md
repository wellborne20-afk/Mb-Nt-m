# Mbǎ'Ntām (ERP & SaaS PME Afrique)

**Mbǎ'Ntām** est une solution logicielle SaaS B2B tout-en-un de gestion d'entreprise conçue spécifiquement pour les PME, commerces, cabinets et établissements d'Afrique francophone, avec une priorité accordée aux règles juridiques, fiscales et comptables de la zone OHADA et du **Cameroun**.

---

## 🚀 Fonctionnalités & Modules Intégrés

1. **Tableau de Bord Général**
   - Suivi en temps réel de la trésorerie disponible (Caisses physiques, MTN MoMo, Orange Money, Banques).
   - Indicateurs financiers clés : Chiffre d'affaires, entrées, sorties, bénéfice net, factures impayées.
   - Bloc de vigie et d'alertes : Dépassements de budget, échéances de paiement, congés en attente.

2. **Journal Financier & Gestion de Caisse**
   - Journal quotidien des encaissements et décaissements avec support natif du **Mobile Money (MTN MoMo, Orange Money)** et des virements bancaires.
   - Suivi rigoureux des avances (acomptes) et calcul automatique du reste dû.
   - Procès-verbaux de clôture journalière de caisse avec détection et justification des écarts.
   - Budgets mensuels par catégorie avec seuils d'alerte (80% et 100%).
   - Prévisionnel de trésorerie automatique à 30, 60 et 90 jours.

3. **Facturation & Devis (Conforme DGI Cameroun)**
   - Édition de devis, factures proforma, factures définitives et reçus libératoires.
   - Calcul paramétrable de la **TVA à 19,25%** et des droits de timbre fiscal.
   - **QR Code** de vérification d'authenticité fiscale imprimé sur les factures.
   - Conversion en 1 clic : Devis ➔ Facture ➔ Reçu de caisse.
   - Bouton de **relance automatique par WhatsApp** des clients en retard d'échéance.

4. **Ressources Humaines & Personnel**
   - Fiches agents complètes : CNI, N° CNPS Cameroun, coordonnées bancaires / MoMo, situation familiale.
   - Circuit de demande et validation des congés et absences.
   - Générateur automatique de documents officiels : **Attestation de travail**, **Contrat de travail**, **Certificat de travail**.
   - Pipeline de recrutement et conversion d'un candidat retenu en employé en 1 clic.

5. **Paie & Traitements (Moteur Fiscal Camerounais)**
   - Calcul automatique du salaire net à partir du salaire brut, des indemnités (transport, logement) et des primes.
   - Retenues sociales et fiscales calculées :
     - **CNPS part salariale** : 4,2% (plafonné à 750 000 FCFA de salaire de base).
     - **IRPP** (Impôt sur le Revenu des Personnes Physiques) selon le barème progressif.
     - **CAC** (Centimes Additionnels Communaux) : 10% de l'IRPP.
     - **CFC** (Crédit Foncier du Cameroun) : 1%.
     - **RAV** (Redevance Audiovisuelle CRTV) : tranches forfaitaires.
   - Génération en lot des bulletins de paie et impression PDF individuelle conforme.
   - Débit automatique de la caisse/banque choisie lors du règlement des salaires.
   - Export CSV d'ordre de virement bancaire et de batch Mobile Money.

6. **Parc Matériel & Fiches de Décharge**
   - Inventaire physique complet : Ordinateurs, véhicules, groupes électrogènes (Perkins...), serveurs, mobilier.
   - Attribution à un employé avec **fiche de décharge signée électroniquement**.
   - Constat d'état lors de la restitution et calcul de l'amortissement linéaire.

7. **CRM & Pipeline Commercial**
   - Pipeline de vente en vue **Kanban** interactive : *Nouveau contact ➔ Qualifié ➔ Proposition ➔ Négociation ➔ Gagné*.
   - Fiches prospects et clients géolocalisées (Douala, Yaoundé, Bafoussam, Garoua...) avec lien direct WhatsApp.

8. **Bilans & Analyses Financières**
   - États financiers périodiques (mensuels, trimestriels, annuels).
   - Calcul de la marge nette et ventilation du chiffre d'affaires par gamme de prestations.
   - Export d'états certifiés prêts à imprimer pour la direction et les banques.

9. **Sécurité, Audit & Multi-Entreprise**
   - Architecture multi-tenant : isolation étanche par organisation.
   - Simulation immédiate des rôles (RBAC : Dirigeant, Comptable, RH, Commercial, Employé).
   - **Journal d'audit inaltérable** consignant toutes les actions sensibles (qui, quoi, quand, IP).
   - Sauvegarde intégrale de l'entreprise en fichier JSON téléchargeable et restaurable à tout moment.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Architecture** : PWA Offline-First (localStorage réactif et tolérance aux coupures réseau)
- **Export** : Tableaux CSV, impressions PDF officielles et feuilles de style haute fidélité
- **Devises** : FCFA (XAF par défaut), XOF, EUR, USD avec bascule instantanée
- **Langues** : Bilingue Français (par défaut) et Anglais en un clic

---

## 💻 Démarrage en Développement

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement Vite
npm run dev

# Vérification du typage et linting
npm run lint

# Compilation de production
npm run build
```

---

## 📄 Licence
Sous licence propriétaire - Tous droits réservés **Mbǎ'Ntām Technologies**.
