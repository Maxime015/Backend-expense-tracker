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
    console.error('Error adding grocerie:', err);
    res.status(500).json({ error: 'Failed to add grocerie' });
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
      return res.status(404).json({ error: 'Grocerie not found' });
    }

    const [updated] = await sql`
      UPDATE groceries 
      SET is_completed = ${!grocerie.is_completed}
      WHERE id = ${id}
      RETURNING *
    `;
    
    res.json(updated);
  } catch (err) {
    console.error('Error toggling grocerie:', err);
    res.status(500).json({ error: 'Failed to toggle grocerie' });
  }
};

// Supprimer un grocery
export async function deleteGrocerie(req, res) {
  try {
    const { id } = req.params;

    const result = await sql`
      DELETE FROM groceries WHERE id = ${id}
      RETURNING id
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    
    res.status(200).json({ message: 'Article supprimé avec succès' });
  } catch (err) {
    console.error('Erreur suppression article:', err);
    res.status(500).json({ error: 'Échec de la suppression' });
  }
};

// Mettre à jour le texte d'un grocery
export async function updateGrocerie(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const [updated] = await sql`
      UPDATE groceries
      SET text = ${text}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (!updated) {
      return res.status(404).json({ error: 'Grocerie not found' });
    }
    
    res.json(updated);
  } catch (err) {
    console.error('Error updating grocerie:', err);
    res.status(500).json({ error: 'Failed to update grocerie' });
  }
};

// Supprimer tous les groceries d'un utilisateur
export async function clearAllGroceries(req, res) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { count } = await sql`
      DELETE FROM groceries WHERE user_id = ${userId}
    `;
    res.status(200).json({ message: 'All groceries deleted successfully' });
    res.json({ deletedCount: count });
  } catch (err) {
    console.error('Error clearing groceries:', err);
    res.status(500).json({ error: 'Failed to clear groceries' });
  }
};



// Obtenir le résumé des courses (total et nombre complétés)
export async function getGroceriesSummary(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'ID utilisateur requis' });
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
    console.error('Erreur récupération résumé courses:', error);
    res.status(500).json({ message: 'Erreur serveur interne' });
  }
};