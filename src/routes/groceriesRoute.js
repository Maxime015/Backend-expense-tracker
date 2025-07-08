import express from 'express';
import {
  getGroceries,
  addGrocerie,
  toggleGrocerie,
  updateGrocerie,
  deleteGrocerie,
  getGroceriesSummary,
  clearAllGroceries
} from '../controllers/grocerieController.js';

const router = express.Router();

// GET /groceries/:userId - Récupérer tous les groceries d'un utilisateur
router.get('/:userId', getGroceries);

// POST /groceries - Ajouter un nouveau grocery
router.post('/', addGrocerie);

// PATCH /groceries/:id/toggle - Basculer l'état d'un grocery
router.patch('/:id/toggle', toggleGrocerie);

// PUT /groceries/:id - Mettre à jour un grocery
router.put('/:id', updateGrocerie);

// DELETE /groceries/:id - Supprimer un grocery
router.delete('/:id', deleteGrocerie);

// DELETE /groceries - Supprimer tous les groceries d'un utilisateur
router.delete('/', clearAllGroceries);

// GET /groceries/summary/:userId - Obtenir le résumé des courses
router.get('/summary/:userId', getGroceriesSummary);

export default router;