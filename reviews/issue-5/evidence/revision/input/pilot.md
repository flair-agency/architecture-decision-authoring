# Engineering pilot report
Author: Rui, storage engineer. Version 1, 2026-09-22.
B1. In one synthetic 6 TB accession batch, computing checksums on an isolated catalog-side worker took 5 hours versus 8 hours in the archive storage account. The measurements exclude transfer time and transfer cost.
B2. The worker received complete source-image copies. Originals remained in the archive account. No lender collection, damaged image, or batch above 6 TB was tested.
B3. I recommend allowing catalog-side workers for batches up to 8 TB. I am not the archive owner and cannot authorize this change. No confidentiality review or loan-agreement review was performed.
B4. No signed replacement or amendment of Decision 14 has been recorded in the supplied materials.
