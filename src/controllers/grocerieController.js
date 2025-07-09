import { sql } from "../config/db.js";

// Récupérer tous les groceries d'un utilisateur
export async function getGroceries(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const groceries = await sql`
      SELECT * FROM groceries 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
      
    res.status(200).json(groceries);
  } catch (error) {
    console.error('Error fetching groceries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Ajouter un nouveau grocery
export async function addGrocerie(req, res) {
  try {
    const { userId, text } = req.body;
    
    if (!userId || !text) {
      return res.status(400).json({ 
        error: 'User ID and text are required' 
      });
    }

    const [newGrocerie] = await sql`
      INSERT INTO groceries (user_id, text, is_completed)
      VALUES (${userId}, ${text}, false)
      RETURNING *
    `;
    
    res.status(201).json(newGrocerie);
  } catch (err) {
    console.error('Error adding grocery:', err);
    res.status(500).json({ error: 'Failed to add grocery' });
  }
};

// Basculer l'état d'un grocery
export async function toggleGrocerie(req, res) {
  try {
    const { id } = req.params;

    // Vérifier si le grocery existe
    const [grocerie] = await sql`
      SELECT * FROM groceries WHERE id = ${id}
    `;
    
    if (!grocerie) {
      return res.status(404).json({ error: 'Grocery not found' });
    }

    const [updated] = await sql`
      UPDATE groceries 
      SET is_completed = ${!grocerie.is_completed}
      WHERE id = ${id}
      RETURNING *
    `;
    
    res.json(updated);
  } catch (err) {
    console.error('Error toggling grocery:', err);
    res.status(500).json({ error: 'Failed to toggle grocery' });
  }
};

// Supprimer un grocery
export async function deleteGrocerie(req, res) {
  try {
    const { id } = req.params;

    // Validation supplémentaire
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const result = await sql`
      DELETE FROM groceries 
      WHERE id = ${parseInt(id)}
      RETURNING id
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    
    res.status(200).json({ 
      message: 'Article supprimé avec succès',
      deletedId: result[0].id
    });
  } catch (err) {
    console.error('Erreur suppression article:', err);
    res.status(500).json({ 
      error: 'Échec de la suppression',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



// Mettre à jour le texte d'un grocery
export async function updateGrocerie(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Texte invalide' });
    }

    const [updated] = await sql`
      UPDATE groceries
      SET text = ${text}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;
    
    if (!updated) {
      return res.status(404).json({ error: 'Course non trouvée' });
    }
    
    res.json(updated);
    console.log('Received update for id:', id, 'with text:', text);
  } catch (err) {
    console.error('Erreur mise à jour:', err);
    res.status(500).json({ 
      error: 'Échec de la mise à jour',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



// Supprimer tous les groceries d'un utilisateur
export async function clearAllGroceries(req, res) {
  try {
    const { userId } = req.body;
    
    console.log("Received clear request for user:", userId); // Debug log
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required in request body',
        receivedBody: req.body // Log du corps reçu
      });
    }

    const result = await sql`
      DELETE FROM groceries WHERE user_id = ${userId}
      RETURNING *
    `;
    
    res.status(200).json({ 
      message: 'All groceries deleted successfully',
      deletedCount: result.length
    });
  } catch (err) {
    console.error('Error clearing groceries:', err);
    res.status(500).json({ 
      error: 'Failed to clear groceries',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
}



// Obtenir le résumé des courses (total et nombre complétés)
export async function getGroceriesSummary(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const result = await sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed
      FROM groceries 
      WHERE user_id = ${userId}
    `;
    
    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Error recovery summary races:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};