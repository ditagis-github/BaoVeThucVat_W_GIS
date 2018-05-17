export = {
  capNhatTGSXTT: async (edits: { updates?: any[], adds?: any[], deletes: number[] }) => {
    try {
      let result = await $.post('/map/trongtrot/thoigian/edits',
        {
          edits:JSON.stringify(edits)
        }
      );
      return result;
    } catch (error) {
      throw error;
    }
  }
}