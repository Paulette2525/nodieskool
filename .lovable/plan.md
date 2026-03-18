

## Plan : Simplifier le formulaire de création d'événement

Remplacer les deux champs "Début" et "Fin" (`datetime-local`) par deux champs séparés : **Date** (`type="date"`) et **Heure** (`type="time"`). Le `end_time` sera calculé automatiquement (date + heure + 1h par défaut).

### Changements

**`src/components/community-admin/CommunityAdminEventsTab.tsx`**
- Remplacer le state `start_time`/`end_time` par `event_date` et `event_time`
- Remplacer les deux inputs `datetime-local` par un input `date` ("Date de l'événement") et un input `time` ("Heure de l'événement")
- Dans `handleSubmit`, construire `start_time` à partir de `event_date + event_time`, et `end_time` = `start_time + 1 heure` (durée par défaut)
- Mettre à jour la validation : `disabled={!form.title || !form.event_date || !form.event_time}`

Aucun changement en base de données ni dans le hook `useEvents` — les colonnes `start_time`/`end_time` restent inchangées, seule l'interface de saisie est simplifiée.

