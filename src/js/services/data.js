/**
 * Data service for Supabase queries
 * Handles all database operations
 */

import { supabase } from '../config/supabase.js';

class DataService {
  /**
   * MARTIAL ARTS OPERATIONS
   */

  async getMartialArts() {
    // Get martial arts with their advantages
    const { data, error } = await supabase
      .from('martial_arts')
      .select(`
        *,
        martial_arts_advantages (
          advantage_id,
          position,
          advantages (
            id,
            title
          )
        )
      `)
      .order('position', { ascending: true, nullsFirst: false });

    if (error) throw error;

    // Transform data to match expected format
    return data.map(ma => ({
      id: ma.id,
      name: ma.title,
      subtitle: ma.sub_title,
      slug: this.generateSlug(ma.title),
      description: ma.description,
      image_url: ma.photo_url,
      benefits: ma.martial_arts_advantages
        ?.sort((a, b) => a.position - b.position)
        .map(maa => maa.advantages?.title)
        .filter(Boolean) || [],
      created_at: ma.created_at,
      updated_at: ma.updated_at
    }));
  }

  async getMartialArtById(id) {
    const { data, error } = await supabase
      .from('martial_arts')
      .select(`
        *,
        martial_arts_advantages (
          advantage_id,
          position,
          advantages (
            id,
            title
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Transform to expected format
    return {
      id: data.id,
      name: data.title,
      subtitle: data.sub_title,
      slug: this.generateSlug(data.title),
      description: data.description,
      image_url: data.photo_url,
      benefits: data.martial_arts_advantages
        ?.sort((a, b) => a.position - b.position)
        .map(maa => maa.advantages?.title)
        .filter(Boolean) || [],
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  async getMartialArtBySlug(slug) {
    // Get all martial arts and find by generated slug
    const allMartialArts = await this.getMartialArts();
    const found = allMartialArts.find(ma => ma.slug === slug);

    if (!found) {
      throw new Error('Martial art not found');
    }

    return found;
  }

  async createMartialArt(martialArt) {
    const { name, subtitle, description, image_url, benefits } = martialArt;

    // Insert martial art
    const { data: newMartialArt, error: insertError } = await supabase
      .from('martial_arts')
      .insert([{
        title: name,
        sub_title: subtitle,
        description: description,
        photo_url: image_url
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Insert advantages if provided
    if (benefits && benefits.length > 0) {
      for (let i = 0; i < benefits.length; i++) {
        const benefit = benefits[i];

        // First, create or get the advantage
        const { data: advantage, error: advError } = await supabase
          .from('advantages')
          .insert([{ title: benefit }])
          .select()
          .single();

        if (advError) {
          // If advantage already exists, try to get it
          const { data: existing } = await supabase
            .from('advantages')
            .select('*')
            .eq('title', benefit)
            .single();

          if (existing) {
            // Link to martial art
            await supabase
              .from('martial_arts_advantages')
              .insert([{
                martial_art_id: newMartialArt.id,
                advantage_id: existing.id,
                position: i
              }]);
          }
        } else {
          // Link new advantage to martial art
          await supabase
            .from('martial_arts_advantages')
            .insert([{
              martial_art_id: newMartialArt.id,
              advantage_id: advantage.id,
              position: i
            }]);
        }
      }
    }

    return this.getMartialArtById(newMartialArt.id);
  }

  async updateMartialArt(id, updates) {
    const { name, subtitle, description, image_url, benefits } = updates;

    // Update martial art
    const { data, error } = await supabase
      .from('martial_arts')
      .update({
        title: name,
        sub_title: subtitle,
        description: description,
        photo_url: image_url
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update advantages if provided
    if (benefits) {
      // Delete existing advantage links
      await supabase
        .from('martial_arts_advantages')
        .delete()
        .eq('martial_art_id', id);

      // Add new advantages
      for (let i = 0; i < benefits.length; i++) {
        const benefit = benefits[i];

        // Create or get the advantage
        const { data: advantage, error: advError } = await supabase
          .from('advantages')
          .insert([{ title: benefit }])
          .select()
          .single();

        if (advError) {
          // If advantage already exists, try to get it
          const { data: existing } = await supabase
            .from('advantages')
            .select('*')
            .eq('title', benefit)
            .single();

          if (existing) {
            await supabase
              .from('martial_arts_advantages')
              .insert([{
                martial_art_id: id,
                advantage_id: existing.id,
                position: i
              }]);
          }
        } else {
          await supabase
            .from('martial_arts_advantages')
            .insert([{
              martial_art_id: id,
              advantage_id: advantage.id,
              position: i
            }]);
        }
      }
    }

    return this.getMartialArtById(id);
  }

  async deleteMartialArt(id) {
    // Delete advantage links first
    await supabase
      .from('martial_arts_advantages')
      .delete()
      .eq('martial_art_id', id);

    // Delete martial art
    const { error } = await supabase
      .from('martial_arts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Generate slug from title
   */
  generateSlug(title) {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * CLASSES OPERATIONS
   */

  async getClasses() {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getClassById(id) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createClass(classData) {
    console.log('Creating class with data:', classData);

    const { data, error } = await supabase
      .from('classes')
      .insert([classData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Class created successfully:', data);
    return data;
  }

  async updateClass(id, updates) {
    console.log('Updating class:', id, 'with data:', updates);

    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    console.log('Class updated successfully:', data);
    return data;
  }

  async deleteClass(id) {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * INSTRUCTORS OPERATIONS
   */

  async getInstructors() {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getInstructorById(id) {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createInstructor(instructor) {
    const { data, error } = await supabase
      .from('instructors')
      .insert([instructor])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateInstructor(id, updates) {
    const { data, error } = await supabase
      .from('instructors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteInstructor(id) {
    const { error } = await supabase
      .from('instructors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * CONTACT SUBMISSIONS OPERATIONS
   */

  async getSubmissions() {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createSubmission(submission) {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([{
        name: submission.name,
        email: submission.email,
        message: submission.message,
        status: 'new'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSubmissionStatus(id, status) {
    const { data, error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSubmission(id) {
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * USERS OPERATIONS (Admin only)
   */

  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateUserRole(userId, role) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * STATISTICS (Admin Dashboard)
   */

  async getStats() {
    const [martialArts, classes, instructors, submissions] = await Promise.all([
      this.getMartialArts(),
      this.getClasses(),
      this.getInstructors(),
      this.getSubmissions()
    ]);

    return {
      totalMartialArts: martialArts.length,
      totalClasses: classes.length,
      totalInstructors: instructors.length,
      totalSubmissions: submissions.length,
      newSubmissions: submissions.filter(s => s.status === 'new').length
    };
  }
}

// Export singleton instance
export const dataService = new DataService();
