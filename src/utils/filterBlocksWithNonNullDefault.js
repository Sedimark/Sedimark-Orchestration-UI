export default function filterBlocksWithNonNullDefaultAndNotTrigger(blocks){
  return blocks.filter(block => {
    
    if (block.configuration && typeof block.configuration === 'object' && !Array.isArray(block.configuration)) {
      
      const configEntries = Object.values(block.configuration);
      return configEntries.some(entry => {
        return (
          typeof entry === 'object' &&
          entry !== null &&
          'default' in entry &&
          entry.default !== null &&
          entry.type !== 'trigger' 
        );
      });
    }
    
    return false;
  });
}