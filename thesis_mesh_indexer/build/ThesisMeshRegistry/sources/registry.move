module thesis_mesh::registry {
    use std::string::String;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    #[event]
    struct DatasetUploadedEvent has drop, store {
        title: String,
        faculty: String,
        researcher: String,
        shelby_hash: String,
        upload_time: u64,
    }

    public entry fun log_dataset(
        account: &signer,
        title: String,
        faculty: String,
        researcher: String,
        shelby_hash: String
    ) {
        let upload_event = DatasetUploadedEvent {
            title,
            faculty,
            researcher,
            shelby_hash,
            upload_time: timestamp::now_microseconds(),
        };
        
        event::emit(upload_event);
    }
}
